export interface IProjectPage {
  img: string;
  url: string;
}

export interface IProject {
  title: string;
  description: string;
  slug: string;
  pages: IProjectPage[];
}
