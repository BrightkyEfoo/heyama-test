export interface ObjectItem {
  _id: string;
  title: string;
  descripton?: string;
  imageUrl: string;
  createdAt: string;
}

export interface PaginatedResponse {
  data: ObjectItem[];
  total: number;
  page: number;
  totalPages: number;
}
