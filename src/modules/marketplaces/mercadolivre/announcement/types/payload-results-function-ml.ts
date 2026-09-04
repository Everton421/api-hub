export interface IPayloadResultFunction {
    success: boolean;
    mlItemId: string;
    message: string;
    permalink?: string;
    affectedFields: number;
}
