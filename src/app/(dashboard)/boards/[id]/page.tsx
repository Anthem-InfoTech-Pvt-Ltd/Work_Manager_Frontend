import BoardPageClient from './BoardPageClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: 'default' }, { id: '1' }];
}

export default function BoardPage() {
  return <BoardPageClient />;
}
