import * as React from "react";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const countryCodes = [
  { code: "+55", country: "Brasil", flag: "🇧🇷" },
  { code: "+1", country: "EUA/Canadá", flag: "🇺🇸" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+595", country: "Paraguai", flag: "🇵🇾" },
  { code: "+598", country: "Uruguai", flag: "🇺🇾" },
];

const PhoneInput = React.forwardRef<HTMLDivElement, PhoneInputProps>(
  ({ value = "+55", onChange, className }, ref) => {
    // Separar código do país e número
    const [countryCode, setCountryCode] = React.useState("+55");
    const [phoneNumber, setPhoneNumber] = React.useState("");

    React.useEffect(() => {
      // Inicializar a partir do value
      const match = value.match(/^(\+\d+)\s*(.*)$/);
      if (match) {
        setCountryCode(match[1]);
        setPhoneNumber(match[2]);
      }
    }, []);

    const formatPhone = (value: string) => {
      // Remove tudo que não é dígito
      const numbers = value.replace(/\D/g, "");
      
      // Formato brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value);
      setPhoneNumber(formatted);
      onChange?.(`${countryCode} ${formatted}`);
    };

    const handleCountryCodeChange = (newCode: string) => {
      setCountryCode(newCode);
      onChange?.(`${newCode} ${phoneNumber}`);
    };

    return (
      <div ref={ref} className={`flex gap-2 ${className || ""}`}>
        <Select value={countryCode} onValueChange={handleCountryCodeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countryCodes.map((item) => (
              <SelectItem key={item.code} value={item.code}>
                {item.flag} {item.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={phoneNumber}
          onChange={handlePhoneChange}
          maxLength={15}
          placeholder="(00) 00000-0000"
          className="flex-1"
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
