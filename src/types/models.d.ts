declare module '../models/ownerDetail' {
  import { Document, Model } from 'mongoose';
  const OwnerDetail: Model<Document>;
  export default OwnerDetail;
}

declare module '../models/landProposedDetails' {
  import { Document, Model } from 'mongoose';
  const LandProposedDetails: Model<Document>;
  export default LandProposedDetails;
}

declare module '../models/landProposedAffectedPlotDetails' {
  import { Document, Model } from 'mongoose';
  const LandProposedAffectedPlotDetails: Model<Document>;
  export default LandProposedAffectedPlotDetails;
}

declare module '../models/requestDetailsConsultant' {
  import { Document, Model } from 'mongoose';
  const RequestDetailsConsultant: Model<Document>;
  export default RequestDetailsConsultant;
}

declare module '../models/trnApplicationStatus' {
  import { Document, Model } from 'mongoose';
  const TrnApplicationStatus: Model<Document>;
  export default TrnApplicationStatus;
}

declare module '../models/trnDrcTransferDetails' {
  import { Document, Model } from 'mongoose';
  const TrnDrcTransferDetails: Model<Document>;
  export default TrnDrcTransferDetails;
}

declare module '../models/User' {
  import { Document, Model } from 'mongoose';
  const User: Model<Document>;
  export default User;
}

declare module '../models/ApiKeyAgency' {
  import { Document, Model } from 'mongoose';
  const ApiKeyAgency: Model<Document>;
  export default ApiKeyAgency;
}

declare module '../models/tdr' {
  import { Document, Model } from 'mongoose';
  const TDR: Model<Document>;
  export default TDR;
}
