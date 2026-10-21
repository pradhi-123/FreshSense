/**
 * C9 topics.py port to Node.js / ES module
 * Tamil & English topic + feeling extraction with strict negation logic.
 */

const TOPICS = {
  sleep: ["தூக்கம்", "தூங்க", "உறக்கம்", "sleep", "insomnia"],
  family: ["வீடு", "வீட்டு", "குடும்ப", "மனைவி", "மகள்", "மகன்", "அம்மா", "அப்பா", "பிள்ளை", "குழந்தை", "family", "home", "daughter", "wife", "son"],
  fatigue: ["களைப்பு", "சோர்வு", "அசதி", "டயர்ட்", "fatigue", "tired", "exhausted", "weary"],
  leave: ["விடுப்பு", "லீவ்", "லீவு", "leave", "holiday", "vacation"],
  workload: ["டியூட்டி", "பணி", "வேலை", "நைட்", "duty", "work", "shift", "patrol"],
  mood: ["மனசு", "மனம்", "mood", "feeling", "stress"]
};

const NEGATIVE_WORDS = [
  "கவலை", "களைப்பு", "சோர்வு", "அசதி", "தனிமை", "பயம்", "கஷ்டம்", "கோபம்", "நினைவா", "ஞாபகமா",
  "worry", "worried", "sad", "lonely", "scared", "fear", "hard", "angry", "miss", "pain", "trouble"
];

const NEGATION_REGEX = /(இல்லை|வில்லை|முடியவில்லை|மாட்டேன்|இல்ல\b|முடியல|வரல|தூங்கல|கிடைக்கல|not|no\b|never|can't|cannot|don't|didn't|won't)/i;

const POSITIVE_WORDS = ["நல்லா", "நன்றாக", "சந்தோஷ", "மகிழ்ச்சி", "நிம்மதி", "good", "fine", "well", "happy", "calm"];

const CLAUSE_SPLIT = /[.?!,;।]+|\s(?:ஆனா|ஆனால்|but)\s/i;

const URGENT_REGEX = /(தற்கொலை|சாகனும்|வாழ பிடிக்கல|முடிச்சுக்கப்போறேன்|suicide|end my life|kill myself|cannot go on)/i;

export function extractTopics(transcript) {
  if (!transcript || typeof transcript !== 'string') {
    return { mentions: [], neg_counts: {}, isUrgent: false };
  }

  const clauses = transcript.split(CLAUSE_SPLIT);
  const mentions = [];
  const isUrgent = URGENT_REGEX.test(transcript);

  for (let clause of clauses) {
    clause = clause.trim();
    if (!clause) continue;

    const negated = NEGATION_REGEX.test(clause);
    const hasNegWord = NEGATIVE_WORDS.some(w => clause.toLowerCase().includes(w.toLowerCase()));
    const hasPosWord = POSITIVE_WORDS.some(w => clause.toLowerCase().includes(w.toLowerCase()));

    // Find topic matches
    let matched = [];
    for (const [topic, stems] of Object.entries(TOPICS)) {
      if (stems.some(s => clause.toLowerCase().includes(s.toLowerCase()))) {
        matched.push(topic);
      }
    }

    if (matched.length === 0 && hasNegWord) {
      matched = ["mood"];
    }

    let polarity = "neutral";
    if (negated || hasNegWord) {
      polarity = "negative"; // Negation / negative feeling always wins
    } else if (hasPosWord) {
      polarity = "positive";
    }

    for (const topic of matched) {
      mentions.push({ topic, polarity, clause });
    }
  }

  const neg_counts = {};
  for (const m of mentions) {
    if (m.polarity === "negative") {
      neg_counts[m.topic] = (neg_counts[m.topic] || 0) + 1;
    }
  }

  return { mentions, neg_counts, isUrgent };
}
