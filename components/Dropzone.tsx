import { useDropzone } from 'react-dropzone';
import {Camera} from '@gravity-ui/icons';

export default function Dropzone({ onDrop }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': [],
      'image/jpeg': [],
      'image/webp': [],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex h-25 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed transition-colors ${
        isDragActive ? 'border-gray-500 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2 text-gray-500">
        <Camera className='size-8' />
        <span className="text-xs font-medium">Şəkil əlavə edin</span>
      </div>
    </div>
  );
}