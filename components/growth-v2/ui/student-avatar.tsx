const AVATAR_COLORS = ['#6c5ce7', '#e17055', '#00b894', '#4a90d9', '#a29bfe', '#f0932b', '#fd79a8', '#636e72'];

function hashIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % AVATAR_COLORS.length;
}

type StudentAvatarProps = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
};

export function StudentAvatar({ name, size = 'md' }: StudentAvatarProps) {
  const color = AVATAR_COLORS[hashIndex(name)];
  const firstChar = name.charAt(0);
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-11 w-11 text-base',
    lg: 'h-16 w-16 text-2xl'
  };

  return (
    <div
      className={`flex items-center justify-center rounded-xl font-serif font-bold text-white ${sizeClasses[size]}`}
      style={{ backgroundColor: color }}
    >
      {firstChar}
    </div>
  );
}
