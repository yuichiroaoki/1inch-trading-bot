export enum Status {
  Stay = 0,
  Buy,
  Sell,
}

export interface IPriveChangeInfo {
  base: number;
  change: number;
  status: Status;
}
