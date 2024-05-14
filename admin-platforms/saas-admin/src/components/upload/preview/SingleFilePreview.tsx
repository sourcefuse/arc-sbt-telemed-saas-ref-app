//
import Image from '../../image';
//
import { CustomFile } from '../types';

// ----------------------------------------------------------------------

type Props = {
  file: CustomFile | string | null;
};

export default function SingleFilePreview({ file }: Props) {
  if (!file) {
    return null;
  }

  const imgUrl = typeof file === 'string' ? file : file.preview;
  const title = typeof file === 'string' ? undefined : file.name;

  return (
    <Image
      title={title}
      alt="file preview"
      src={imgUrl}
      sx={{
        top: 8,
        left: 8,
        zIndex: 8,
        borderRadius: 1,
        position: 'absolute',
        width: 'calc(100% - 16px)',
        height: 'calc(100% - 16px)',
      }}
    />
  );
}
