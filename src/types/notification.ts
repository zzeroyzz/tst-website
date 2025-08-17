/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  timeAgo: string;
  data: any;
  read: boolean;
}
