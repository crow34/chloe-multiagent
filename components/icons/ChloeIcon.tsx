
import React from 'react';

const ChloeIcon: React.FC<React.SVGProps<HTMLDivElement>> = (props) => (
  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center" {...props}>
    <span className="text-xl font-bold text-white">C</span>
  </div>
);

export default ChloeIcon;
