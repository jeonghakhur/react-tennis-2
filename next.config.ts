/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'phinf.pstatic.net',
      'k.kakaocdn.net',
    ], // 외부 호스트를 추가합니다.
  },
};

export default nextConfig;
