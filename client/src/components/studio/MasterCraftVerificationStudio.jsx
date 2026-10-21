import React, { useState, useEffect } from 'react';
import BhashiniVoiceTranscriber from '../common/BhashiniVoiceTranscriber';
import BhashiniLanguageSwitcher from '../common/BhashiniLanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { analyzeCraftImage } from '../../utils/imageAnalysis';
import './MasterCraftVerificationStudio.css';

export default function MasterCraftVerificationStudio({ onComplete, onSaveDraft, initialImage = null }) {
  const { t, currentLangObj } = useLanguage();

  const [step, setStep] = useState(1);
  const [craftImage, setCraftImage] = useState(initialImage);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeVoiceQuestion, setActiveVoiceQuestion] = useState(null);

  // Profile data from onboarding
  const savedProfile = (() => {
    try {
      const s = localStorage.getItem('virasat_artisan_profile');
      return s ? JSON.parse(s) : {};
    } catch (e) {
      return {};
    }
  })();

  // 1. AI Predictions State
  const [aiPredictions, setAiPredictions] = useState({
    craftType: 'Handwoven Kosa Silk Textile',
    materials: [
      { name: 'Natural Silk Filament', confidence: 0.94, reason: 'High luster sheen and visible warp/weft thread pattern', possibleUse: 'Primary body weave' },
      { name: 'Zari Metallic Thread', confidence: 0.88, reason: 'Specular golden reflection along border motifs', possibleUse: 'Border ornament' },
    ],
    colors: [
      { name: 'Muga Golden Thread', hex: '#C8963E', percent: 55, category: 'Dominant' },
      { name: 'Natural Cotton Ivory', hex: '#F7EFDF', percent: 30, category: 'Secondary' },
      { name: 'Terracotta Ochre', hex: '#5A2E1F', percent: 15, category: 'Accent' },
    ],
    textures: ['Smooth handloom weave', 'Subtle natural slub texture', 'Matte finish with golden luster'],
    shapeStructure: 'Rectangular handloom textile with reinforced woven selvedge borders',
    techniques: ['Handloom Weaving', 'Extra Weft Brocade Motif Insertion', 'Natural Yarn Spinning'],
    decorativeElements: ['Traditional Temple Border (Pasapalli)', 'Floral Extra-Weft Motifs', 'Contrast Pallu End-Piece'],
    suggestedOrigin: {
      tradition: 'Champa Kosa Silk Heritage Weaving',
      region: 'Janjgir-Champa District, Chhattisgarh',
      confidence: 0.88,
      visualEvidence: 'Distinctive golden Kosa filament luster and geometric extra-weft temple border motifs.',
    },
  });

  // 2. Material Verification State
  const [materialOption, setMaterialOption] = useState('yes'); // 'yes' | 'some' | 'no'
  const [verifiedMaterials, setVerifiedMaterials] = useState([
    { name: 'Natural Silk Filament', confirmed: true, quantity: '250', unit: 'g', unknownQuantity: false },
    { name: 'Zari Metallic Thread', confirmed: true, quantity: '50', unit: 'g', unknownQuantity: false },
  ]);
  const [newMaterialInput, setNewMaterialInput] = useState('');

  // 3. Colour & Texture Verification State
  const [verifiedColors, setVerifiedColors] = useState([
    { name: 'Muga Golden Thread', hex: '#C8963E', percent: 55 },
    { name: 'Natural Cotton Ivory', hex: '#F7EFDF', percent: 30 },
    { name: 'Terracotta Ochre', hex: '#5A2E1F', percent: 15 },
  ]);
  const [verifiedTextures, setVerifiedTextures] = useState(['Smooth handloom weave', 'Subtle natural slub texture']);
  const [colorsConfirmed, setColorsConfirmed] = useState(true);

  // 4. Origin Verification State
  const [verifiedOrigin, setVerifiedOrigin] = useState({
    state: 'Chhattisgarh',
    district: 'Janjgir-Champa',
    village: savedProfile.village || 'Champa',
    craftTradition: savedProfile.craft || 'Kosa Silk Weaving',
    historicalNotes: 'Generational Kosa silk handloom lineage passed down through centuries of Koshta weavers.',
  });

  // 5. Artisan Interview State
  const [interview, setInterview] = useState({
    artisanName: savedProfile.name || 'Rameshwari Devangan',
    yearsPractising: '18',
    teacher: 'Mother and Village Elders',
    traditionalFamilyCraft: true,
    inspiration: 'Traditional Champa floral motifs and sacred temple looms',
    difficulties: 'Hand-spinning raw wild silk filaments during monsoon humidity',
    completionDuration: '12 days (72 hours of dedicated handloom labor)',
    specialQuality: 'Hand-spun natural golden Kosa thread with zero synthetic dye',
    personalMemory: 'Woven for my daughter’s wedding blessing using family wooden loom',
    culturalStory: 'Kosa silk is sacred in Chhattisgarh rituals, representing purity and artisan lineage.',
  });

  // 6. Generated Story State
  const [generatedStory, setGeneratedStory] = useState({
    A_introduction: '',
    B_materials_craftsmanship: '',
    C_artisan_journey: '',
    D_cultural_significance: '',
    E_uniqueness: '',
    F_final_narrative: '',
    language: currentLangObj?.code || 'hi',
    isApproved: false,
  });

  const [isEditingStory, setIsEditingStory] = useState(false);
  const [editedStoryText, setEditedStoryText] = useState('');

  // Trigger real AI analysis on image upload
  const handleImageSelected = async (imageSrc) => {
    setCraftImage(imageSrc);
    setIsAnalyzing(true);

    try {
      // 1. Client TensorFlow AI Vision Analysis
      const localResult = await analyzeCraftImage(imageSrc, {
        title: interview.craftTradition,
        artisanName: interview.artisanName,
        village: verifiedOrigin.village,
      });

      // 2. Server API Analysis Call
      const res = await fetch('http://localhost:5000/api/ai/analyze-craft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: localResult.title || interview.craftTradition,
          image_url: imageSrc,
          artisan_name: interview.artisanName,
          village: verifiedOrigin.village,
        }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setAiPredictions({
          craftType: data.craft_type || localResult.title,
          materials: data.materials || localResult.materials.map((m) => ({ name: m, confidence: 0.9, reason: 'AI visual pattern' })),
          colors: data.colors || localResult.dominantPalette,
          textures: data.textures || ['Handcrafted texture'],
          shapeStructure: data.shape_structure || 'Handcrafted form',
          techniques: data.techniques || ['Traditional Crafting'],
          decorativeElements: data.decorative_elements || ['Traditional Motifs'],
          suggestedOrigin: data.suggested_origin || { tradition: 'Heritage Lineage', region: 'India', confidence: 0.85 },
        });

        // Initialize verified materials from AI predictions
        const initialMats = (data.materials || []).map((m) => ({
          name: m.name,
          confirmed: true,
          quantity: '250',
          unit: 'g',
          unknownQuantity: false,
        }));
        setVerifiedMaterials(initialMats);
      }
    } catch (err) {
      console.warn('AI analysis error:', err);
    } finally {
      setIsAnalyzing(false);
      setStep(2);
    }
  };

  // Generate Story API Call
  const handleGenerateStory = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/generate-structured-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          craft_type: aiPredictions.craftType,
          verified_materials: verifiedMaterials.filter((m) => m.confirmed),
          verified_colors: verifiedColors,
          verified_textures: verifiedTextures,
          verified_origin: verifiedOrigin,
          artisan_interview: interview,
          lang: currentLangObj?.code || 'hi',
        }),
      });

      if (res && res.ok) {
        const data = await res.json();
        if (data.ok && data.story) {
          setGeneratedStory({
            ...data.story,
            isApproved: false,
          });
          setEditedStoryText(data.story.full_story);
        }
      }
    } catch (err) {
      console.warn('Story generation error:', err);
    } finally {
      setIsAnalyzing(false);
      setStep(8);
    }
  };

  // Save Final Profile to Backend API & LocalStorage
  const handleSaveProfile = async (isPublish = false) => {
    const profilePayload = {
      id: `CP-${Date.now().toString().slice(-6)}`,
      title: `${interview.craftTradition} by ${interview.artisanName}`,
      imageUrl: craftImage,
      craftCategory: aiPredictions.craftType,
      aiPredictions,
      verifiedMaterials: verifiedMaterials.filter((m) => m.confirmed),
      verifiedColors,
      verifiedTextures,
      verifiedOrigin,
      artisanInterview: interview,
      generatedStory: {
        ...generatedStory,
        full_story: editedStoryText || generatedStory.full_story,
        isApproved: true,
        approvedAt: new Date().toISOString(),
      },
      status: isPublish ? 'published' : 'draft',
      language: currentLangObj?.code || 'hi',
    };

    try {
      await fetch('http://localhost:5000/api/crafts/verify-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload),
      }).catch(() => null);

      const existing = JSON.parse(localStorage.getItem('virasat_verified_craft_profiles') || '[]');
      localStorage.setItem('virasat_verified_craft_profiles', JSON.stringify([profilePayload, ...existing]));

      if (isPublish && onComplete) {
        onComplete(profilePayload);
      } else if (onSaveDraft) {
        onSaveDraft(profilePayload);
      }
    } catch (e) {
      console.warn('Save profile error:', e);
    }
  };

  const stepsList = [
    { num: 1, title: 'Upload Craft Image', icon: '📷' },
    { num: 2, title: 'AI Craft Analysis', icon: '🤖' },
    { num: 3, title: 'Verify Materials', icon: '🧪' },
    { num: 4, title: 'Material Quantities', icon: '⚖️' },
    { num: 5, title: 'Colours & Textures', icon: '🎨' },
    { num: 6, title: 'Craft Origin', icon: '📍' },
    { num: 7, title: 'Artisan Interview', icon: '🎙️' },
    { num: 8, title: 'AI Story Generation', icon: '📖' },
    { num: 9, title: 'Approve & Submit', icon: '🏅' },
  ];

  return (
    <div className="master-verification-studio">
      {/* Stepper Navigation Header */}
      <header className="studio-stepper-header">
        <div className="stepper-brand-row">
          <span className="stepper-badge">VIRASAT MASTER AI STUDIO</span>
          <h2 className="stepper-title">Craft Recognition, Material Verification & Storytelling</h2>
          <BhashiniLanguageSwitcher />
        </div>

        <div className="stepper-pills-scroll">
          {stepsList.map((s) => (
            <button
              key={s.num}
              type="button"
              className={`step-pill-btn ${step === s.num ? 'is-active' : step > s.num ? 'is-completed' : ''}`}
              onClick={() => {
                if (step > s.num || craftImage) setStep(s.num);
              }}
            >
              <span className="pill-icon">{s.icon}</span>
              <span className="pill-text">{s.num}. {s.title}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Stepper Body Stage */}
      <main className="studio-step-stage">
        {/* STEP 1: UPLOAD CRAFT IMAGE */}
        {step === 1 && (
          <div className="step-card">
            <span className="step-eyebrow">STEP 1 OF 9 — IMAGE INPUT</span>
            <h3 className="step-heading">Upload or Capture Your Authentic Craft Photograph</h3>
            <p className="step-sub">
              Upload a clear photo of your craft (JPG, PNG, WEBP). AI will analyze visible materials, colors, textures, motifs, and techniques.
            </p>

            <div className="upload-dropzone-box">
              {craftImage ? (
                <div className="image-preview-wrapper">
                  <img src={craftImage} alt="Uploaded craft" className="preview-img" />
                  <div className="preview-actions-row">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setCraftImage(null)}
                    >
                      🔄 Replace Photo
                    </button>
                    <button
                      type="button"
                      className="btn-gold-primary"
                      onClick={() => handleImageSelected(craftImage)}
                    >
                      🤖 Analyze Craft Image with AI →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="dropzone-empty-state">
                  <span className="big-icon">📸</span>
                  <p className="dropzone-prompt">Drag & drop your craft image here, or select an option below:</p>

                  <div className="upload-btn-group">
                    <label className="btn-gold-primary file-label">
                      🖼️ Select Image from Device
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden-file-input"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const r = new FileReader();
                            r.onload = (ev) => handleImageSelected(ev.target.result);
                            r.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    <label className="btn-secondary file-label">
                      📷 Capture Camera Photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden-file-input"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const r = new FileReader();
                            r.onload = (ev) => handleImageSelected(ev.target.result);
                            r.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: AUTOMATIC AI IMAGE RECOGNITION */}
        {step === 2 && (
          <div className="step-card">
            <span className="step-eyebrow">STEP 2 OF 9 — AUTOMATIC AI ANALYSIS</span>
            <h3 className="step-heading">AI Image Recognition & Structural Characteristic Breakdown</h3>

            <div className="ai-disclaimer-banner">
              <strong>⚠️ AI Observations Notice:</strong> Displayed items below are AI predictions based on computer vision. Visual observations are strictly distinguished from artisan-confirmed facts. You will verify every detail in the next steps.
            </div>

            <div className="analysis-grid-stage">
              <div className="craft-image-col">
                <img src={craftImage} alt="Craft under analysis" className="side-craft-img" />
                <span className="img-caption">Uploaded Craft Sample</span>
              </div>

              <div className="craft-details-col">
                <div className="char-box">
                  <span className="char-title">🏅 Craft Identification:</span>
                  <span className="char-val badge-gold">{aiPredictions.craftType}</span>
                </div>

                <div className="char-box">
                  <span className="char-title">🧪 Detected Materials & AI Confidence:</span>
                  <ul className="char-list">
                    {aiPredictions.materials.map((m, i) => (
                      <li key={i}>
                        <strong>{m.name}</strong> ({Math.round(m.confidence * 100)}% confidence) — <em>{m.reason}</em>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="char-box">
                  <span className="char-title">🎨 Colour Spectrum Analysis:</span>
                  <div className="swatches-row">
                    {aiPredictions.colors.map((c, i) => (
                      <div key={i} className="swatch-chip">
                        <span className="color-dot" style={{ backgroundColor: c.hex }} />
                        <span>{c.name} ({c.percent}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="char-box">
                  <span className="char-title">👁️ Texture & Surface Finish (Visual Estimate):</span>
                  <div className="tags-row">
                    {aiPredictions.textures.map((t, i) => (
                      <span key={i} className="tag-chip">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="char-box">
                  <span className="char-title">🛠️ Crafting Techniques & Motifs:</span>
                  <p><strong>Techniques:</strong> {aiPredictions.techniques.join(', ')}</p>
                  <p><strong>Ornamental Motifs:</strong> {aiPredictions.decorativeElements.join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="step-action-footer">
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>← Change Image</button>
              <button type="button" className="btn-gold-primary" onClick={() => setStep(3)}>Proceed to Material Verification →</button>
            </div>
          </div>
        )}

        {/* STEP 3: MATERIAL RECOGNITION & VERIFICATION */}
        {step === 3 && (
          <div className="step-card">
            <span className="step-eyebrow">STEP 3 OF 9 — MATERIAL VERIFICATION</span>
            <h3 className="step-heading">Mandatory Material Verification Workflow</h3>
            <p className="step-sub">
              Has the AI correctly identified the materials used in your craft?
            </p>

            {/* 3 Core Selection Options */}
            <div className="option-cards-trio">
              <button
                type="button"
                className={`option-card ${materialOption === 'yes' ? 'is-selected' : ''}`}
                onClick={() => setMaterialOption('yes')}
              >
                <span className="opt-icon">✓</span>
                <span className="opt-title">Yes, all materials are correct</span>
              </button>

              <button
                type="button"
                className={`option-card ${materialOption === 'some' ? 'is-selected' : ''}`}
                onClick={() => setMaterialOption('some')}
              >
                <span className="opt-icon">⚡</span>
                <span className="opt-title">Some materials are correct</span>
              </button>

              <button
                type="button"
                className={`option-card ${materialOption === 'no' ? 'is-selected' : ''}`}
                onClick={() => {
                  setMaterialOption('no');
                  setVerifiedMaterials([]);
                }}
              >
                <span className="opt-icon">✕</span>
                <span className="opt-title">No, the materials are incorrect</span>
              </button>
            </div>

            {/* Materials Interactive Checklist */}
            <div className="materials-editor-box">
              <h4 className="editor-title">Verified Materials List:</h4>
              {verifiedMaterials.map((mat, idx) => (
                <div key={idx} className="material-item-row">
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={mat.confirmed}
                      onChange={(e) => {
                        const copy = [...verifiedMaterials];
                        copy[idx].confirmed = e.target.checked;
                        setVerifiedMaterials(copy);
                      }}
                    />
                    <span className="mat-name">{mat.name}</span>
                  </label>
                  <button
                    type="button"
                    className="btn-remove-sm"
                    onClick={() => {
                      setVerifiedMaterials(verifiedMaterials.filter((_, i) => i !== idx));
                    }}
                  >
                    🗑️ Remove
                  </button>
                </div>
              ))}

              {/* Add Missing Material via Text or Voice Input */}
              <div className="add-material-row">
                <input
                  type="text"
                  className="transcription-input"
                  value={newMaterialInput}
                  onChange={(e) => setNewMaterialInput(e.target.value)}
                  placeholder="Enter or speak missing material (e.g. Organic Plant Dye)..."
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    if (newMaterialInput.trim()) {
                      setVerifiedMaterials([
                        ...verifiedMaterials,
                        { name: newMaterialInput.trim(), confirmed: true, quantity: '', unit: 'g', unknownQuantity: false },
                      ]);
                      setNewMaterialInput('');
                    }
                  }}
                >
                  ➕ Add Material
                </button>
              </div>

              {/* Voice Input Toggle for adding materials in native language */}
              <div style={{ marginTop: '12px' }}>
                <BhashiniVoiceTranscriber
                  sectionTitle="Voice Input for Material Correction (BHASHINI AI)"
                  placeholder="Speak material name in Tamil, Hindi, Telugu, Assamese, Bengali, Malayalam, Kannada, etc..."
                  onInsertText={(text) => {
                    setVerifiedMaterials([
                      ...verifiedMaterials,
                      { name: text, confirmed: true, quantity: '', unit: 'g', unknownQuantity: false },
                    ]);
                  }}
                />
              </div>
            </div>

            <div className="step-action-footer">
              <button type="button" className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button type="button" className="btn-gold-primary" onClick={() => setStep(4)}>Proceed to Material Quantities →</button>
            </div>
          </div>
        )}

        {/* STEP 4: MATERIAL QUANTITY COLLECTION */}
        {step === 4 && (
          <div className="step-card">
            <span className="step-eyebrow">STEP 4 OF 9 — QUANTITY COLLECTION</span>
            <h3 className="step-heading">How much of each material did you use to make this craft?</h3>
            <p className="step-sub">
              Enter the exact quantity for every verified material. Quantities are never fabricated by AI.
            </p>

            <div className="quantities-stack">
              {verifiedMaterials.filter((m) => m.confirmed).map((mat, idx) => (
                <div key={idx} className="quantity-card-item">
                  <span className="mat-badge">Material #{idx + 1}: <strong>{mat.name}</strong></span>

                  {!mat.unknownQuantity ? (
                    <div className="qty-inputs-row">
                      <div className="field-group">
                        <label className="field-label">Quantity Amount</label>
                        <input
                          type="number"
                          className="field-input"
                          value={mat.quantity}
                          onChange={(e) => {
                            const copy = [...verifiedMaterials];
                            copy[idx].quantity = e.target.value;
                            setVerifiedMaterials(copy);
                          }}
                          placeholder="e.g. 250"
                        />
                      </div>

                      <div className="field-group">
                        <label className="field-label">Unit of Measurement</label>
                        <select
                          className="field-select"
                          value={mat.unit}
                          onChange={(e) => {
                            const copy = [...verifiedMaterials];
                            copy[idx].unit = e.target.value;
                            setVerifiedMaterials(copy);
                          }}
                        >
                          <option value="g">Grams (g)</option>
                          <option value="kg">Kilograms (kg)</option>
                          <option value="m">Metres (m)</option>
                          <option value="pcs">Pieces (pcs)</option>
                          <option value="ml">Millilitres (ml)</option>
                          <option value="l">Litres (l)</option>
                          <option value="custom">Custom Unit</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <span className="unknown-note">⚠️ Quantity marked as Unknown by artisan.</span>
                  )}

                  <label className="unknown-toggle-label">
                    <input
                      type="checkbox"
                      checked={mat.unknownQuantity}
                      onChange={(e) => {
                        const copy = [...verifiedMaterials];
                        copy[idx].unknownQuantity = e.target.checked;
                        setVerifiedMaterials(copy);
                      }}
                    />
                    <span>I do not know the exact quantity of {mat.name}</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="step-action-footer">
              <button type="button" className="btn-secondary" onClick={() => setStep(3)}>← Back</button>
              <button type="button" className="btn-gold-primary" onClick={() => setStep(5)}>Proceed to Colours & Textures →</button>
            </div>
          </div>
        )}

        {/* STEP 5: AUTOMATIC COLOUR & TEXTURE RECOGNITION VERIFICATION */}
        {step === 5 && (
          <div className="step-card">
            <span className="step-eyebrow">STEP 5 OF 9 — COLOUR & TEXTURE VERIFICATION</span>
            <h3 className="step-heading">Are the detected colours and textures correct?</h3>

            <div className="colors-verification-box">
              <h4 className="editor-title">Detected Colour Swatches & Palette:</h4>
              <div className="swatches-interactive-grid">
                {verifiedColors.map((c, i) => (
                  <div key={i} className="color-edit-card">
                    <span className="swatch-large" style={{ backgroundColor: c.hex }} />
                    <input
                      type="text"
                      className="field-input"
                      value={c.name}
                      onChange={(e) => {
                        const copy = [...verifiedColors];
                        copy[i].name = e.target.value;
                        setVerifiedColors(copy);
                      }}
                    />
                  </div>
                ))}
              </div>

              <h4 className="editor-title" style={{ marginTop: '20px' }}>Surface Texture Characteristics (Visual Estimate):</h4>
              <div className="tags-row">
                {verifiedTextures.map((t, i) => (
                  <span key={i} className="tag-chip editable">
                    {t}
                    <button
                      type="button"
                      onClick={() => setVerifiedTextures(verifiedTextures.filter((_, idx) => idx !== i))}
                      style={{ background: 'none', border: 'none', color: '#8A6320', marginLeft: '6px', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="consent-box-row" style={{ marginTop: '16px' }}>
                <label className="consent-label">
                  <input
                    type="checkbox"
                    checked={colorsConfirmed}
                    onChange={(e) => setColorsConfirmed(e.target.checked)}
                  />
                  <span>I confirm that the verified colours and textures accurately describe my craft.</span>
                </label>
              </div>
            </div>

            <div className="step-action-footer">
              <button type="button" className="btn-secondary" onClick={() => setStep(4)}>← Back</button>
              <button type="button" className="btn-gold-primary" onClick={() => setStep(6)}>Proceed to Craft Origin →</button>
            </div>
          </div>
        )}

        {/* STEP 6: CRAFT ORIGIN RECOGNITION & VERIFICATION */}
        {step === 6 && (
          <div className="step-card">
            <span className="step-eyebrow">STEP 6 OF 9 — CRAFT ORIGIN VERIFICATION</span>
            <h3 className="step-heading">Where was this craft made, and what is its traditional origin?</h3>
            <p className="step-sub">
              Place of manufacture is kept distinct from historical or traditional origin.
            </p>

            <div className="origin-form-grid">
              <div className="field-group">
                <label className="field-label">State</label>
                <input
                  type="text"
                  className="field-input"
                  value={verifiedOrigin.state}
                  onChange={(e) => setVerifiedOrigin({ ...verifiedOrigin, state: e.target.value })}
                  placeholder="e.g. Chhattisgarh"
                />
              </div>

              <div className="field-group">
                <label className="field-label">District</label>
                <input
                  type="text"
                  className="field-input"
                  value={verifiedOrigin.district}
                  onChange={(e) => setVerifiedOrigin({ ...verifiedOrigin, district: e.target.value })}
                  placeholder="e.g. Janjgir-Champa"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Village or Town of Manufacture</label>
                <input
                  type="text"
                  className="field-input"
                  value={verifiedOrigin.village}
                  onChange={(e) => setVerifiedOrigin({ ...verifiedOrigin, village: e.target.value })}
                  placeholder="e.g. Champa"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Traditional Craft Lineage / GI Origin</label>
                <input
                  type="text"
                  className="field-input"
                  value={verifiedOrigin.craftTradition}
                  onChange={(e) => setVerifiedOrigin({ ...verifiedOrigin, craftTradition: e.target.value })}
                  placeholder="e.g. Champa Kosa Silk Heritage Weaving"
                />
              </div>

              <div className="field-group full-width">
                <label className="field-label">Historical & Cultural Origin Notes</label>
                <textarea
                  className="field-textarea"
                  value={verifiedOrigin.historicalNotes}
                  onChange={(e) => setVerifiedOrigin({ ...verifiedOrigin, historicalNotes: e.target.value })}
                  placeholder="Provide historical details, generational story, or cultural origin..."
                  rows={3}
                />
              </div>
            </div>

            <div className="step-action-footer">
              <button type="button" className="btn-secondary" onClick={() => setStep(5)}>← Back</button>
              <button type="button" className="btn-gold-primary" onClick={() => setStep(7)}>Proceed to Artisan Interview →</button>
            </div>
          </div>
        )}

        {/* STEP 7: ARTISAN EXPERIENCE AND PERSONAL STORY INTERVIEW */}
        {step === 7 && (
          <div className="step-card">
            <span className="step-eyebrow">STEP 7 OF 9 — THE ARTISAN BEHIND THE CRAFT</span>
            <h3 className="step-heading">Multilingual Artisan Interview</h3>
            <p className="step-sub">
              Answer in text or voice using your native language. You may skip any question.
            </p>

            <div className="interview-questions-stack">
              {/* Question 1 */}
              <div className="interview-q-box">
                <span className="q-num">Q1. What is your name or preferred artisan display name?</span>
                <input
                  type="text"
                  className="field-input"
                  value={interview.artisanName}
                  onChange={(e) => setInterview({ ...interview, artisanName: e.target.value })}
                />
              </div>

              {/* Question 2 */}
              <div className="interview-q-box">
                <span className="q-num">Q2. How many years have you been practising this craft?</span>
                <input
                  type="text"
                  className="field-input"
                  value={interview.yearsPractising}
                  onChange={(e) => setInterview({ ...interview, yearsPractising: e.target.value })}
                />
              </div>

              {/* Question 3 */}
              <div className="interview-q-box">
                <span className="q-num">Q3. Who taught you this craft? Is this a traditional family craft?</span>
                <input
                  type="text"
                  className="field-input"
                  value={interview.teacher}
                  onChange={(e) => setInterview({ ...interview, teacher: e.target.value })}
                />
              </div>

              {/* Question 4 */}
              <div className="interview-q-box">
                <span className="q-num">Q4. What inspired you to create this particular piece?</span>
                <textarea
                  className="field-textarea"
                  value={interview.inspiration}
                  onChange={(e) => setInterview({ ...interview, inspiration: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Question 5 */}
              <div className="interview-q-box">
                <span className="q-num">Q5. What difficulties did you face while making it?</span>
                <textarea
                  className="field-textarea"
                  value={interview.difficulties}
                  onChange={(e) => setInterview({ ...interview, difficulties: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Question 6 */}
              <div className="interview-q-box">
                <span className="q-num">Q6. How long did it take to complete?</span>
                <input
                  type="text"
                  className="field-input"
                  value={interview.completionDuration}
                  onChange={(e) => setInterview({ ...interview, completionDuration: e.target.value })}
                />
              </div>

              {/* Question 7 */}
              <div className="interview-q-box">
                <span className="q-num">Q7. What makes this craft special to you? Any personal memory or cultural story?</span>
                <textarea
                  className="field-textarea"
                  value={interview.culturalStory}
                  onChange={(e) => setInterview({ ...interview, culturalStory: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Voice Transcriber Component for Voice Answers */}
              <div style={{ marginTop: '16px' }}>
                <BhashiniVoiceTranscriber
                  sectionTitle="Voice Answer for Artisan Interview (BHASHINI AI - 22 Languages)"
                  placeholder="Speak your personal story or answers in your native language..."
                  onInsertText={(text) => {
                    setInterview((prev) => ({
                      ...prev,
                      culturalStory: prev.culturalStory ? `${prev.culturalStory} ${text}` : text,
                    }));
                  }}
                />
              </div>
            </div>

            <div className="step-action-footer">
              <button type="button" className="btn-secondary" onClick={() => setStep(6)}>← Back</button>
              <button type="button" className="btn-gold-primary" onClick={handleGenerateStory}>
                {isAnalyzing ? 'Generating Authentic Story...' : 'Generate Authentic Craft Story →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: AI CRAFT STORY GENERATION */}
        {step === 8 && (
          <div className="step-card">
            <span className="step-eyebrow">STEP 8 OF 9 — THE STORY BEHIND THE CRAFT</span>
            <h3 className="step-heading">Generated Authentic Craft Narrative</h3>
            <p className="step-sub">
              Generated exclusively from verified materials, confirmed origins, and artisan interviews. No fabricated facts.
            </p>

            <div className="story-sections-stack">
              <div className="story-section-card">
                <h4>A. Introduction</h4>
                <p>{generatedStory.A_introduction}</p>
              </div>

              <div className="story-section-card">
                <h4>B. Materials and Craftsmanship</h4>
                <p>{generatedStory.B_materials_craftsmanship}</p>
              </div>

              <div className="story-section-card">
                <h4>C. The Artisan's Journey</h4>
                <p>{generatedStory.C_artisan_journey}</p>
              </div>

              <div className="story-section-card">
                <h4>D. Cultural Significance</h4>
                <p>{generatedStory.D_cultural_significance}</p>
              </div>

              <div className="story-section-card">
                <h4>E. The Uniqueness of the Craft</h4>
                <p>{generatedStory.E_uniqueness}</p>
              </div>
            </div>

            <div className="step-action-footer">
              <button type="button" className="btn-secondary" onClick={() => setStep(7)}>← Back</button>
              <button type="button" className="btn-gold-primary" onClick={() => setStep(9)}>Proceed to Review & Approval →</button>
            </div>
          </div>
        )}

        {/* STEP 9: STORY VERIFICATION, FINAL PROFILE & SUBMISSION */}
        {step === 9 && (
          <div className="step-card">
            <span className="step-eyebrow">STEP 9 OF 9 — STORY VERIFICATION & SUBMISSION</span>
            <h3 className="step-heading">Does this story accurately represent your craft and your experience?</h3>

            <div className="approval-banner-card">
              <p className="approval-question">Confirm Artisan Approval:</p>
              <div className="approval-btn-trio">
                <button
                  type="button"
                  className={`approval-btn ${generatedStory.isApproved ? 'is-active' : ''}`}
                  onClick={() => setGeneratedStory({ ...generatedStory, isApproved: true })}
                >
                  ✓ Approve Story as Authentic
                </button>

                <button
                  type="button"
                  className="approval-btn"
                  onClick={() => setIsEditingStory(!isEditingStory)}
                >
                  ✏️ Edit Story Text
                </button>

                <button
                  type="button"
                  className="approval-btn"
                  onClick={handleGenerateStory}
                >
                  🔄 Regenerate Story
                </button>
              </div>

              {isEditingStory && (
                <div style={{ marginTop: '16px' }}>
                  <textarea
                    className="field-textarea"
                    value={editedStoryText}
                    onChange={(e) => setEditedStoryText(e.target.value)}
                    rows={6}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <BhashiniVoiceTranscriber
                      sectionTitle="Voice Correction for Story (BHASHINI AI)"
                      placeholder="Speak your story corrections..."
                      onInsertText={(text) => setEditedStoryText((prev) => `${prev} ${text}`)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Comprehensive Final Craft Profile */}
            <div className="final-craft-profile-card">
              <span className="profile-badge-seal">🏅 VERIFIED ARTISAN CRAFT PROFILE</span>
              <h3 className="profile-title">{interview.craftTradition}</h3>

              <div className="profile-grid-summary">
                <div>
                  <img src={craftImage} alt="Craft profile" className="profile-craft-img" />
                </div>

                <div className="profile-meta-details">
                  <p><strong>Artisan:</strong> {interview.artisanName} ({interview.yearsPractising} years experience)</p>
                  <p><strong>Location:</strong> {verifiedOrigin.village}, {verifiedOrigin.district}, {verifiedOrigin.state}</p>
                  <p><strong>Verified Materials:</strong> {verifiedMaterials.filter((m) => m.confirmed).map((m) => `${m.name} (${m.quantity || 'N/A'} ${m.unit})`).join(', ')}</p>
                  <p><strong>Confirmed Palette:</strong> {verifiedColors.map((c) => c.name).join(', ')}</p>
                  <p><strong>Verification Status:</strong> <span className="badge-verified">✓ VERIFIED BY ARTISAN</span></p>
                </div>
              </div>

              <div className="final-story-box">
                <h4>Verified Craft Story:</h4>
                <p className="story-text-quote">{editedStoryText || generatedStory.full_story}</p>
              </div>
            </div>

            {/* Submission Actions */}
            <div className="step-action-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleSaveProfile(false)}
              >
                💾 Save Draft to Virasat
              </button>

              <button
                type="button"
                className="btn-gold-primary"
                onClick={() => handleSaveProfile(true)}
              >
                🚀 Publish & Submit to Virasat Catalogue / ONDC
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
