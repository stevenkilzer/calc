import React, { useState, useEffect, ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { formatNumberWithCommas, parseFormattedNumber } from '@/lib/utils';

interface FormattedNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
}

export const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({ 
  value, 
  onChange, 
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState(formatNumberWithCommas(value));

  useEffect(() => {
    setDisplayValue(formatNumberWithCommas(value));
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setDisplayValue(rawValue);
    const numericValue = parseFormattedNumber(rawValue);
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  };

  const handleBlur = () => {
    setDisplayValue(formatNumberWithCommas(value));
  };

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};

export default FormattedNumberInput;