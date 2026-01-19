import { IJitsiMeetExternalApi } from "@jitsi/react-sdk/lib/types";

export interface ExtendedJitsiMeetExternalApi extends IJitsiMeetExternalApi {
    addListener: (event: string, callback: (data: any) => void) => void;
    removeListener: (event: string, callback: (data: any) => void) => void;
}