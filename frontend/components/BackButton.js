import { FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";

const BackButton = ({ route = "/", label = "Back" }) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(route)}
      className="flex items-center gap-2 py-2 px-4 sm:px-6 md:pl-14 mt-4 
                 text-base sm:text-lg font-semibold text-white 
                 hover:text-cyan-400 focus:text-cyan-600 transition-colors 
                 rounded-md"
      style={{
        fontSize: "clamp(0.875rem, 2vw, 1.25rem)", // Responsive font size
      }}
    >
      {/* Responsive Icon */}
      <FiArrowLeft
        className="text-xl sm:text-2xl"
        style={{
          fontSize: "clamp(1.25rem, 2vw, 1.5rem)", // Responsive icon size
        }}
      />
      {/* Responsive Label */}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

export default BackButton;