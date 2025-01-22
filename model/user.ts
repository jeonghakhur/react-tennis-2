export type AuthUser = {
    id: string;
    name: string;
    userName: string;
    email: string;
    image?: string;
  };
  
  export type SimpleUser = Pick<AuthUser, 'id' | 'userName' | 'image'>;
  
  export type HomeUser = AuthUser & {
    following: SimpleUser[];
    followers: SimpleUser[];
    bookmarks: string[];
  };
  
  export type SearchUser = SimpleUser & {
    following: number;
    followers: number;
  };
  
  export type ProfileUser = SearchUser & {
    name: string;
    posts: number;
  };
  