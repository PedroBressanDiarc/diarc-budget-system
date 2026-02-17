import { useLocation } from "wouter";

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  const [, setLocation] = useLocation();

  // Parser de menções (@usuário) e referências (#requisição/#manutenção)
  const parseContent = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    
    // Regex combinado para menções e referências
    const combinedRegex = /(@\w+)|(#[\w\s-]+)/g;
    let match;
    
    while ((match = combinedRegex.exec(text)) !== null) {
      // Adicionar texto antes do match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const fullMatch = match[0];
      
      if (fullMatch.startsWith('@')) {
        // Menção de usuário
        const username = fullMatch.substring(1);
        parts.push(
          <span
            key={match.index}
            className="text-primary font-semibold cursor-pointer hover:underline"
            onClick={() => {
              // Futuramente pode abrir perfil do usuário
              console.log('Menção clicada:', username);
            }}
          >
            {fullMatch}
          </span>
        );
      } else if (fullMatch.startsWith('#')) {
        // Referência a requisição ou manutenção
        const reference = fullMatch.substring(1);
        parts.push(
          <span
            key={match.index}
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
            onClick={() => {
              // Tentar navegar para requisição ou manutenção
              // Futuramente pode fazer busca mais inteligente
              setLocation(`/requisicoes?search=${encodeURIComponent(reference)}`);
            }}
          >
            {fullMatch}
          </span>
        );
      }
      
      lastIndex = match.index + fullMatch.length;
    }
    
    // Adicionar texto restante
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text];
  };

  return <div className="whitespace-pre-wrap break-words">{parseContent(content)}</div>;
}
