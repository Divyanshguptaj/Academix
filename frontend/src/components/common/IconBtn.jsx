export default function IconBtn({
  text,
  onclick,
  children,
  disabled,
  outline = false,
  customClasses,
  type,
}) {
  return (
    <button
      onClick={onclick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${
        disabled
          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
          : "bg-yellow-500 text-black hover:bg-yellow-400"
      } ${customClasses}`}
    >
      {text}
    </button>
  );
}
