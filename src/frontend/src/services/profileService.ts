import { MOCK_PROFILE } from "../mocks/organizerData";
import { mockRequest } from "./mockClient";

export const profileService = {
  getProfile: () => mockRequest(MOCK_PROFILE),
};
