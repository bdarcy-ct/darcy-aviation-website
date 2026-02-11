export default function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="blob blob-blue w-96 h-96 -top-48 -left-48 animate-float" />
      <div className="blob blob-gold w-72 h-72 top-1/3 right-0 animate-float-delayed" />
      <div className="blob blob-purple w-80 h-80 bottom-0 left-1/4 animate-float" />
      <div className="blob blob-blue w-64 h-64 bottom-1/4 right-1/4 animate-float-delayed" />
    </div>
  );
}
