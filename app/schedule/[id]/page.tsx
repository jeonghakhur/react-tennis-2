type Props = {
  params: Promise<{ id: string }>;
};
export default async function Page({ params }: Props) {
  const { id } = await params; // params를 비동기로 처리
  return <p>ID: {id}</p>;
}
