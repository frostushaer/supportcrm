import 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: string;
    regionId?: string;
  }

  interface Session {
    user: {
      id?: string;
      role?: string;
      regionId?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    regionId?: string;
  }
}
