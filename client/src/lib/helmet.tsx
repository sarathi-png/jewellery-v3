import { useEffect, type ReactNode } from 'react';

interface HelmetProps {
  children: ReactNode;
}

export function Helmet({ children }: HelmetProps) {
  useEffect(() => {
    const titleEl = document.querySelector('title');
    const metaEls = document.querySelectorAll('meta');
    const originalTitle = titleEl?.textContent || '';
    const originalMetas: { name?: string; content?: string }[] = [];

    metaEls.forEach((el) => {
      const name = el.getAttribute('name');
      const content = el.getAttribute('content');
      if (name && content) {
        originalMetas.push({ name, content });
      }
    });

    const fragments = document.createElement('div');
    fragments.innerHTML = (children as unknown as string) || '';

    Array.from(fragments.children).forEach((child) => {
      if (child.tagName === 'TITLE') {
        document.title = child.textContent || '';
      }
      if (child.tagName === 'META') {
        const name = child.getAttribute('name');
        const content = child.getAttribute('content');
        if (name && content !== null) {
          let existing = document.querySelector(`meta[name="${name}"]`);
          if (!existing) {
            existing = document.createElement('meta');
            existing.setAttribute('name', name);
            document.head.appendChild(existing);
          }
          existing.setAttribute('content', content);
        }
      }
    });

    return () => {
      document.title = originalTitle;
    };
  }, [children]);

  return null;
}

export const HelmetProvider = ({ children }: { children: ReactNode }) => <>{children}</>;
