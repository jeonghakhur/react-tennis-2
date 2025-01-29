type Props = {
  children: React.ReactNode;
};
export function Container({ children }: Props) {
  return <main className="px-5">{children}</main>;
}
