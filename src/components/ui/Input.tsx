interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
  }
  
  export const Input: React.FC<InputProps> = ({ label, ...props }) => (
    <div style={{ marginBottom: '15px' }}>
      {label && <label style={{ color: 'var(--color-dark-navy)', display: 'block' }}>{label}</label>}
      <input className="ui-input" {...props} />
    </div>
  );