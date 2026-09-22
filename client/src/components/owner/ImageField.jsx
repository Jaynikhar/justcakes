import { useEffect, useState } from 'react';

/** File input with a preview that cleans up its object URL. */
export function ImageField({ label, name, onChange, existingUrl = '', required = false, hint }) {
  const [preview, setPreview] = useState('');

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const handleChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : '');
    onChange(file);
  };

  const shown = preview || existingUrl;

  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        required={required}
      />
      <span className="field-hint">{hint || 'JPG, PNG or WEBP up to 3 MB.'}</span>
      {shown ? <img className="file-preview" src={shown} alt="Selected preview" /> : null}
    </div>
  );
}

export default ImageField;
