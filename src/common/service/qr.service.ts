import { singleton } from "tsyringe";
import QRCode from "qrcode";
import { Logger } from "winston";

import { InternalServerError } from "../../api/common/model";

@singleton()
export class QrService {
  constructor(private readonly logger: Logger) {}

  generateQrCode(value: string) {
    try {
      return QRCode.toDataURL(value);
    } catch (error) {
      this.logger.error("Failed to create QRCode", error);

      throw new InternalServerError();
    }
  }
}
