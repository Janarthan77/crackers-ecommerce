import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#FFF8F0] px-4 py-20 text-center min-h-[70vh]">
      <div className="text-9xl mb-6 drop-shadow-lg">🎇</div>
      <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-4 font-display">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">404</span>
      </h1>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Oops! Page Not Found</h2>
      <p className="text-gray-600 max-w-md mx-auto mb-10 text-lg">
        It looks like the page you are looking for has been moved or no longer exists. 
        Don&apos;t worry, you can always head back to our home page to explore our premium crackers!
      </p>
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform text-lg"
      >
        <FaHome size={20} />
        Back to Home
      </Link>
    </div>
  );
}
