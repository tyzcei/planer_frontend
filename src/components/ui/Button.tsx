interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
  }
  
  export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => {
    const styles: Record<string, React.CSSProperties> = {
      primary: { backgroundColor: 'var(--color-primary-blue)', color: 'white' },
      secondary: { backgroundColor: 'var(--color-accent-purple)', color: 'white' },
      outline: { border: '2px solid var(--color-primary-blue)', color: 'var(--color-primary-blue)', background: 'none' }
    };
  
    return (
      <button className={`ui-button ${variant}`} style={styles[variant]} {...props}>
        {children}
      </button>
    );
  };