import { useParams } from 'react-router-dom';
import MagicLinkResponse from '@/components/vendor/MagicLinkResponse';

const VendorRespond = () => {
  const { token } = useParams<{ token: string }>();

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Invalid link</p>
      </div>
    );
  }

  return <MagicLinkResponse inviteToken={token} />;
};

export default VendorRespond;
