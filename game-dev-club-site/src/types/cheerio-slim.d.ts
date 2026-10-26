// 'cheerio/slim' 은 package.json exports 로만 노출돼서 이 프로젝트의 moduleResolution("node") 로는
// 타입을 못 찾는다. 본체와 같은 API 라 본체 타입을 그대로 쓴다.
// (본체 'cheerio' 는 undici 를 같이 불러와 Next 14 번들링에서 문제가 나므로 slim 을 쓴다)
declare module "cheerio/slim" {
  export * from "cheerio";
}
