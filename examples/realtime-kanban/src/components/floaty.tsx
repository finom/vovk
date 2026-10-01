import { motion } from 'framer-motion';
import { AudioLines, MicIcon, MoveUpRight, PhoneCallIcon } from 'lucide-react';

const Floaty = ({
  isActive,
  isTalking,
  handleClick,
}: {
  isActive: boolean;
  isTalking: boolean;
  handleClick: () => void;
}) => {
  const getIcon = () => {
    if (!isActive) {
      return <PhoneCallIcon className="text-secondary" />;
    } else if (isActive && isTalking) {
      return <AudioLines className="text-secondary" />;
    } else {
      return <MicIcon className="text-secondary" />;
    }
  };

  return (
    <div className="fixed top-5 right-5 z-100">
      <div>
        <MoveUpRight className="absolute text-red-600 scale-150 -left-6 top-14" />
        <div className="absolute text-red-600 -left-18 top-20 rotate-45 text-lg text-semibold">
          Voice AI
        </div>
      </div>
      <div className="relative flex items-center justify-center w-16 h-16">
        {isActive && isTalking && (
          <>
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-foreground z-0"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-foreground z-0"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-foreground z-0"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1.5 }}
            />
          </>
        )}
        <button
          type="button"
          className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-xl cursor-pointer z-10 bg-foreground"
          onClick={handleClick}
        >
          {getIcon()}
        </button>
      </div>
    </div>
  );
};

export default Floaty;
