import { type SubjectInput } from './engine';

export function buildShareUrl(
  origin: string,
  sectionKey: string,
  planDate: string,
  inputs: SubjectInput[],
): string {
  const params = new URLSearchParams();
  params.set('section', sectionKey);
  params.set('planDate', planDate);
  const compact = inputs.map((i) => `${i.code}:${i.attended}:${i.conducted}`).join(',');
  params.set('data', compact);
  return `${origin}/attendance?${params.toString()}`;
}

export function parseShareUrl(
  searchParams: URLSearchParams,
): { section: string; planDate: string; inputs: SubjectInput[] } | null {
  const section = searchParams.get('section');
  const planDate = searchParams.get('planDate');
  const dataStr = searchParams.get('data');
  if (!section || !planDate || !dataStr) return null;
  try {
    const inputs: SubjectInput[] = dataStr.split(',').map((pair) => {
      const [code, attended, conducted] = pair.split(':');
      return { code, attended: parseInt(attended) || 0, conducted: parseInt(conducted) || 0 };
    });
    return { section, planDate, inputs };
  } catch {
    return null;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
