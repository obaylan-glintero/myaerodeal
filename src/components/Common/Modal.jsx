import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import SearchableDropdown from './SearchableDropdown';

const Modal = ({ modalType, editingItem, closeModal }) => {
  // Initialize formData with proper defaults for dealFromLead
  const [formData, setFormData] = useState(() => {
    if (modalType === 'dealFromLead' && editingItem) {
      const initialData = {
        clientName: editingItem.name || '',
        relatedLead: editingItem.id,
        status: 'LOI Signed'
      };
      console.log('🎯 Initializing deal from lead:', initialData);
      return initialData;
    }
    return editingItem || {};
  });
  const { colors } = useTheme();

  const {
    addLead, updateLead,
    addAircraft, updateAircraft,
    addDeal, updateDeal,
    addTask, updateTask,
    presentAircraftToLead,
    leads, aircraft, deals
  } = useStore();

  const handleSubmit = async () => {
    try {
      if (modalType === 'lead') {
        if (editingItem) {
          // Filter out fields that shouldn't be updated through the basic form
          const { timestampedNotes, presentations, ...updateData } = formData;
          console.log('📝 Modal submitting lead update:', { editingItemId: editingItem.id, formData, updateData });
          await updateLead(editingItem.id, updateData);
        } else {
          await addLead(formData);
        }
      } else if (modalType === 'aircraft') {
        if (editingItem) {
          // Filter out presentations array for aircraft too
          const { presentations, ...updateData } = formData;
          await updateAircraft(editingItem.id, updateData);
        } else {
          await addAircraft(formData);
        }
      } else if (modalType === 'deal' || modalType === 'dealFromLead') {
        if (editingItem && modalType === 'deal') {
          await updateDeal(editingItem.id, formData);
        } else {
          await addDeal(formData);
        }
      } else if (modalType === 'task') {
        if (editingItem) {
          await updateTask(editingItem.id, formData);
        } else {
          await addTask(formData);
        }
      } else if (modalType === 'presentation' || modalType === 'presentationFromAircraft') {
        const leadId = modalType === 'presentation' ? editingItem.id : formData.leadId;
        const aircraftId = modalType === 'presentationFromAircraft' ? editingItem.id : formData.aircraftId;
        await presentAircraftToLead(leadId, aircraftId, formData.notes, formData.price);
      }
      closeModal();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.message || 'Failed to save changes. Please try again.'}`);
    }
  };

  const getTitle = () => {
    const action = editingItem ? 'Edit' : 'Add';
    if (modalType === 'dealFromLead') return 'Add Deal';
    if (modalType === 'presentationFromAircraft' || modalType === 'presentation') return 'Present Aircraft';
    return `${action} ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: colors.cardBg }}>
        <div className="p-6 border-b flex justify-between items-center" style={{ backgroundColor: colors.primary }}>
          <h3 className="text-xl font-semibold" style={{ color: colors.secondary }}>{getTitle()}</h3>
          <button onClick={closeModal} className="hover:bg-opacity-80 p-1 rounded" style={{ color: colors.secondary }}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {modalType === 'lead' && <LeadForm formData={formData} setFormData={setFormData} />}
          {modalType === 'aircraft' && <AircraftForm formData={formData} setFormData={setFormData} />}
          {(modalType === 'deal' || modalType === 'dealFromLead') && (
            <DealForm formData={formData} setFormData={setFormData} editingItem={editingItem} modalType={modalType} />
          )}
          {modalType === 'task' && <TaskForm formData={formData} setFormData={setFormData} />}
          {(modalType === 'presentation' || modalType === 'presentationFromAircraft') && (
            <PresentationForm formData={formData} setFormData={setFormData} modalType={modalType} editingItem={editingItem} />
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 rounded-lg font-semibold"
              style={{ backgroundColor: colors.primary, color: colors.secondary }}
            >
              {editingItem ? 'Update' : 'Create'}
            </button>
            <button
              onClick={closeModal}
              className="flex-1 px-6 py-3 rounded-lg border-2 font-semibold"
              style={{ backgroundColor: colors.secondary, borderColor: colors.primary, color: colors.primary }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Form Components
const LeadForm = ({ formData, setFormData }) => {
  const { colors } = useTheme();

  const inputStyle = {
    backgroundColor: colors.cardBg,
    color: colors.textPrimary,
    borderColor: colors.border,
  };

  const placeholderStyle = `
    ::placeholder {
      color: ${colors.textSecondary};
    }
    select option {
      background-color: ${colors.cardBg};
      color: ${colors.textPrimary};
    }
  `;

  return (
    <div className="space-y-4">
      <style>{placeholderStyle}</style>
      <input
        type="text"
        placeholder="Name *"
        value={formData.name || ''}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Company"
        value={formData.company || ''}
        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      />
      <select
        value={formData.aircraftType || ''}
        onChange={(e) => setFormData({ ...formData, aircraftType: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      >
        <option value="">Select Aircraft Type</option>
        <option value="Light Jet">Light Jet</option>
        <option value="Midsize Jet">Midsize Jet</option>
        <option value="Midsize Jet">Super-Mid Jet</option>
        <option value="Heavy Jet">Heavy Jet</option>
        <option value="Ultra-Long Range">Ultra-Long Range</option>
      </select>
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2" style={{ color: colors.textSecondary }}>
          <input
            type="checkbox"
            checked={formData.budgetKnown || false}
            onChange={(e) => setFormData({ ...formData, budgetKnown: e.target.checked })}
            className="accent-current"
            style={{
              borderColor: colors.border,
              accentColor: colors.primary,
            }}
          />
          Budget Known
        </label>
        {formData.budgetKnown && (
          <input
            type="number"
            placeholder="Budget (USD)"
            value={formData.budget || ''}
            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
            className="flex-1 px-4 py-2 border rounded-lg"
            style={inputStyle}
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Oldest Year"
          value={formData.yearPreference?.oldest || ''}
          onChange={(e) => setFormData({
            ...formData,
            yearPreference: { ...formData.yearPreference, oldest: Number(e.target.value) }
          })}
          className="w-full px-4 py-2 border rounded-lg"
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Newest Year"
          value={formData.yearPreference?.newest || ''}
          onChange={(e) => setFormData({
            ...formData,
            yearPreference: { ...formData.yearPreference, newest: Number(e.target.value) }
          })}
          className="w-full px-4 py-2 border rounded-lg"
          style={inputStyle}
        />
      </div>
      <select
        value={formData.status || 'Inquiry'}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      >
        <option value="Inquiry">Inquiry</option>
        <option value="Presented">Presented</option>
        <option value="Interested">Interested</option>
        <option value="Deal Created">Deal Created</option>
        <option value="Lost">Lost</option>
      </select>
      <textarea
        placeholder="Notes"
        value={formData.notes || ''}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg h-24"
        style={inputStyle}
      />
    </div>
  );
};

const AircraftForm = ({ formData, setFormData }) => {
  const fileInputRef = React.useRef(null);
  const imageInputRef = React.useRef(null);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const { extractAircraftDataFromPDF } = useStore();
  const { colors } = useTheme();

  const inputStyle = {
    backgroundColor: colors.cardBg,
    color: colors.textPrimary,
    borderColor: colors.border,
  };

  const placeholderStyle = `
    ::placeholder {
      color: ${colors.textSecondary};
    }
  `;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // For PDF files, store as base64 for viewing later
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;

        setFormData({
          ...formData,
          specSheet: file.name,
          specSheetData: dataUrl,
          specSheetType: file.type
        });

        // If it's a PDF, try to extract data with AI
        if (file.type === 'application/pdf') {
          setIsExtracting(true);
          console.log('🚀 Starting AI extraction from spec sheet...');

          const extractedData = await extractAircraftDataFromPDF(dataUrl);

          setIsExtracting(false);

          if (extractedData) {
            console.log('✅ Extracted data:', extractedData);
            // Merge extracted data with form, preserving any manually entered data
            setFormData(prev => ({
              ...prev,
              manufacturer: extractedData.manufacturer || prev.manufacturer,
              model: extractedData.model || prev.model,
              yom: extractedData.yom || prev.yom,
              serialNumber: extractedData.serialNumber || prev.serialNumber,
              registration: extractedData.registration || prev.registration,
              totalTime: extractedData.totalTime || prev.totalTime,
              category: extractedData.category || prev.category,
              location: extractedData.location || prev.location,
              price: extractedData.price || prev.price,
              summary: extractedData.summary || prev.summary,
              specSheet: file.name,
              specSheetData: dataUrl,
              specSheetType: file.type
            }));
            alert('✅ AI successfully extracted aircraft data from spec sheet!');
          } else {
            console.log('⚠️ Could not extract data. Fill in manually.');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          imageData: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const searchAircraftImage = async () => {
    if (!formData.serialNumber && !formData.registration) {
      alert('Please enter a Serial Number or Registration to search for images');
      return;
    }

    setIsSearching(true);

    // Simulate API search - In production, you would integrate with:
    // - Aviation Stack API
    // - PlaneSpotter API
    // - Custom Google Image Search
    // - JetPhotos API

    setTimeout(() => {
      setIsSearching(false);
      alert('Image search feature requires API integration.\n\nTo enable automatic image search:\n1. Sign up for an aviation API (e.g., Aviation Stack)\n2. Add API key to your environment\n3. Implement the search logic\n\nFor now, please upload an image manually.');
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <style>{placeholderStyle}</style>
      <input
        type="text"
        placeholder="Manufacturer *"
        value={formData.manufacturer || ''}
        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Model *"
        value={formData.model || ''}
        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Year of Manufacture *"
          value={formData.yom || ''}
          onChange={(e) => setFormData({ ...formData, yom: Number(e.target.value) })}
          className="w-full px-4 py-2 border rounded-lg"
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Serial Number"
          value={formData.serialNumber || ''}
          onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          style={inputStyle}
        />
      </div>
      <input
        type="text"
        placeholder="Registration"
        value={formData.registration || ''}
        onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      />
      <select
        value={formData.category || ''}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      >
        <option value="">Select Category</option>
        <option value="Light Jet">Light Jet</option>
        <option value="Midsize Jet">Midsize Jet</option>
        <option value="Heavy Jet">Heavy Jet</option>
        <option value="Ultra-Long Range">Ultra-Long Range</option>
      </select>
      <input
        type="text"
        placeholder="Location"
        value={formData.location || ''}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      />
      <input
        type="number"
        placeholder="Price (USD) *"
        value={formData.price || ''}
        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      />
      <select
        value={formData.accessType || 'Direct'}
        onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      >
        <option value="Direct">Direct Access</option>
        <option value="Broker">Through Broker</option>
        <option value="Intermediary">Through Intermediary</option>
      </select>

      <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
        <Upload className="mx-auto mb-2" size={32} style={{ color: colors.primary }} />
        <p className="text-sm font-semibold mb-1" style={{ color: colors.textPrimary }}>Aircraft Photo</p>
        <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>Upload image or search automatically</p>

        {formData.imageData && (
          <div className="mb-3">
            <img
              src={formData.imageData}
              alt="Aircraft preview"
              className="mx-auto h-32 w-auto object-contain rounded border"
              style={{ borderColor: colors.border }}
            />
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <input
            ref={imageInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="px-4 py-2 text-sm border rounded-lg"
            style={{
              backgroundColor: colors.primary,
              color: colors.secondary,
              borderColor: colors.border,
            }}
          >
            Upload Image
          </button>
          <button
            type="button"
            onClick={searchAircraftImage}
            disabled={isSearching}
            className="px-4 py-2 text-sm rounded-lg disabled:opacity-50"
            style={{ backgroundColor: colors.primary, color: colors.secondary }}
          >
            {isSearching ? 'Searching...' : 'Auto Search'}
          </button>
        </div>
      </div>

      <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
        <Upload className="mx-auto mb-2" size={32} style={{ color: colors.textSecondary }} />
        <p className="text-sm mb-2" style={{ color: colors.textPrimary }}>
          {isExtracting ? '🤖 AI is extracting data from spec sheet...' : 'Upload Spec Sheet (AI will extract info)'}
        </p>
        {formData.specSheet && !isExtracting && (
          <p className="text-sm mt-2 font-medium" style={{ color: colors.primary }}>
            Selected: {formData.specSheet}
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isExtracting}
          className="mt-2 px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
          style={{
            backgroundColor: colors.primary,
            color: colors.secondary,
            borderColor: colors.border,
          }}
        >
          {isExtracting ? 'Extracting...' : 'Choose File'}
        </button>
      </div>
    </div>
  );
};

const DealForm = ({ formData, setFormData, editingItem, modalType }) => {
  const { leads, aircraft } = useStore();
  const fileInputRef = React.useRef(null);
  const { colors } = useTheme();

  const inputStyle = {
    backgroundColor: colors.cardBg,
    color: colors.textPrimary,
    borderColor: colors.border,
  };

  const placeholderStyle = `
    ::placeholder {
      color: ${colors.textSecondary};
    }
    select option {
      background-color: ${colors.cardBg};
      color: ${colors.textPrimary};
    }
  `;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          document: file.name,
          documentData: event.target.result,
          documentType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <style>{placeholderStyle}</style>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
          Deal Name *
        </label>
        <input
          type="text"
          placeholder="Enter deal name"
          value={formData.dealName || ''}
          onChange={(e) => setFormData({ ...formData, dealName: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          style={inputStyle}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
          Client Name *
        </label>
        <input
          type="text"
          placeholder="Enter client name"
          value={formData.clientName || (modalType === 'dealFromLead' ? editingItem?.name : '')}
          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          style={inputStyle}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
          Related Lead
        </label>
        <SearchableDropdown
          options={leads}
          value={formData.relatedLead || (modalType === 'dealFromLead' ? editingItem?.id : '')}
          onChange={(value) => setFormData({ ...formData, relatedLead: value || null })}
          placeholder="Search by name, company, budget..."
          searchPlaceholder="Search by name, company, budget..."
        getOptionValue={(lead) => lead.id}
        getOptionLabel={(lead) => {
          const budgetStr = lead.budgetKnown && lead.budget
            ? ` - $${(lead.budget / 1000000).toFixed(1)}M`
            : '';
          return `${lead.name} - ${lead.company}${budgetStr}`;
        }}
        renderOption={(lead) => (
          <div>
            <div style={{ fontSize: '15px', fontWeight: '500' }}>
              {lead.name} - {lead.company}
            </div>
            {lead.budgetKnown && lead.budget && (
              <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>
                Budget: ${(lead.budget / 1000000).toFixed(1)}M • {lead.aircraftType}
              </div>
            )}
          </div>
        )}
      />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
          Related Aircraft
        </label>
        <SearchableDropdown
          options={aircraft}
          value={formData.relatedAircraft || ''}
          onChange={(value) => {
            console.log('✈️ Aircraft selected:', value);
            setFormData({ ...formData, relatedAircraft: value || null });
          }}
          placeholder="Select Aircraft"
          searchPlaceholder="Search by model, reg, or MSN..."
        getOptionValue={(ac) => ac.id}
        getOptionLabel={(ac) => `${ac.manufacturer} ${ac.model} (${ac.registration || 'N/A'}, ${ac.serialNumber || 'N/A'}) - $${(ac.price / 1000000).toFixed(1)}M`}
        renderOption={(ac) => (
          <div>
            <div style={{ fontSize: '15px', fontWeight: '500' }}>
              {ac.manufacturer} {ac.model} ({ac.registration || 'N/A'}, {ac.serialNumber || 'N/A'})
            </div>
            <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>
              ${(ac.price / 1000000).toFixed(1)}M • {ac.yom} • {ac.location || 'Location N/A'}
            </div>
          </div>
        )}
      />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
          Deal Value (USD) *
        </label>
        <input
          type="number"
          placeholder="Enter deal value"
          value={formData.dealValue || ''}
          onChange={(e) => setFormData({ ...formData, dealValue: Number(e.target.value) })}
          className="w-full px-4 py-2 border rounded-lg"
          style={inputStyle}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
          Estimated Closing Date
        </label>
        <input
          type="date"
          value={formData.estimatedClosing || ''}
          onChange={(e) => setFormData({ ...formData, estimatedClosing: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          style={inputStyle}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
          Deal Stage
        </label>
        <select
          value={formData.status || 'LOI Signed'}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          style={inputStyle}
        >
          <option value="LOI Signed">LOI Signed</option>
          <option value="Deposit Paid">Deposit Paid</option>
          <option value="APA Drafted">APA Drafted</option>
          <option value="APA Signed">APA Signed</option>
          <option value="PPI Started">PPI Started</option>
          <option value="Defect Rectifications">Defect Rectifications</option>
          <option value="Closing">Closing</option>
          <option value="Closed Won">Closed Won</option>
          <option value="Closed Lost">Closed Lost</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
          Next Step
        </label>
        <input
          type="text"
          placeholder="Enter next step"
          value={formData.nextStep || ''}
          onChange={(e) => setFormData({ ...formData, nextStep: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          style={inputStyle}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
          Next Follow-up Date
        </label>
        <input
          type="date"
          value={formData.followUpDate || ''}
          onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          style={inputStyle}
        />
      </div>
      <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: colors.border, backgroundColor: colors.cardBg }}>
        <Upload className="mx-auto mb-2" size={32} style={{ color: colors.textSecondary }} />
        <p className="text-sm mb-2" style={{ color: colors.textPrimary }}>Upload Deal Document (Contract, LOI, etc.)</p>
        {formData.document && (
          <p className="text-sm mt-2 font-medium" style={{ color: colors.primary }}>
            Selected: {formData.document}
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 px-4 py-2 text-sm border rounded-lg"
          style={{
            backgroundColor: colors.primary,
            color: colors.secondary,
            borderColor: colors.border,
          }}
        >
          Choose File
        </button>
      </div>
    </div>
  );
};

const TaskForm = ({ formData, setFormData }) => {
  const { colors } = useTheme();

  const inputStyle = {
    backgroundColor: colors.cardBg,
    color: colors.textPrimary,
    borderColor: colors.border,
  };

  const placeholderStyle = `
    ::placeholder {
      color: ${colors.textSecondary};
    }
  `;

  return (
    <div className="space-y-4">
      <style>{placeholderStyle}</style>
      <input
        type="text"
        placeholder="Task Title *"
        value={formData.title || ''}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      />
      <textarea
        placeholder="Description"
        value={formData.description || ''}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg h-24"
        style={inputStyle}
      />
      <input
        type="date"
        placeholder="Due Date *"
        value={formData.dueDate || ''}
        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      />
      <select
        value={formData.priority || 'medium'}
        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      >
        <option value="high">High Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="low">Low Priority</option>
      </select>
      <select
        value={formData.status || 'pending'}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      >
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
};

const PresentationForm = ({ formData, setFormData, modalType, editingItem }) => {
  const { leads, aircraft } = useStore();
  const { colors } = useTheme();

  const inputStyle = {
    backgroundColor: colors.cardBg,
    color: colors.textPrimary,
    borderColor: colors.border,
  };

  const placeholderStyle = `
    ::placeholder {
      color: ${colors.textSecondary};
    }
  `;

  return (
    <div className="space-y-4">
      <style>{placeholderStyle}</style>
      {modalType === 'presentation' && (
        <SearchableDropdown
          options={aircraft}
          value={formData.aircraftId || ''}
          onChange={(value) => setFormData(prev => ({ ...prev, aircraftId: value }))}
          placeholder="Select Aircraft"
          searchPlaceholder="Search by model, reg, or MSN..."
          getOptionValue={(ac) => ac.id}
          getOptionLabel={(ac) => `${ac.manufacturer} ${ac.model} (${ac.registration || 'N/A'}, ${ac.serialNumber || 'N/A'}) - $${(ac.price / 1000000).toFixed(1)}M`}
          renderOption={(ac) => (
            <div>
              <div style={{ fontSize: '15px', fontWeight: '500' }}>
                {ac.manufacturer} {ac.model} ({ac.registration || 'N/A'}, {ac.serialNumber || 'N/A'})
              </div>
              <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>
                ${(ac.price / 1000000).toFixed(1)}M • {ac.yom} • {ac.location || 'Location N/A'}
              </div>
            </div>
          )}
        />
      )}
      {modalType === 'presentationFromAircraft' && (
        <SearchableDropdown
          options={leads}
          value={formData.leadId || ''}
          onChange={(value) => setFormData(prev => ({ ...prev, leadId: value }))}
          placeholder="Search by name, company, budget..."
          searchPlaceholder="Search by name, company, budget..."
          getOptionValue={(lead) => lead.id}
          getOptionLabel={(lead) => {
            const budgetStr = lead.budgetKnown && lead.budget
              ? ` - $${(lead.budget / 1000000).toFixed(1)}M`
              : '';
            return `${lead.name} - ${lead.company}${budgetStr}`;
          }}
          renderOption={(lead) => (
            <div>
              <div style={{ fontSize: '15px', fontWeight: '500' }}>
                {lead.name} - {lead.company}
              </div>
              {lead.budgetKnown && lead.budget && (
                <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>
                  Budget: ${(lead.budget / 1000000).toFixed(1)}M • {lead.aircraftType}
                </div>
              )}
            </div>
          )}
        />
      )}
      <input
        type="number"
        placeholder="Price Given (USD) *"
        value={formData.price || ''}
        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
        className="w-full px-4 py-2 border rounded-lg"
        style={inputStyle}
      />
      <textarea
        placeholder="Presentation Notes"
        value={formData.notes || ''}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        className="w-full px-4 py-2 border rounded-lg h-32"
        style={inputStyle}
      />
    </div>
  );
};

export default Modal;