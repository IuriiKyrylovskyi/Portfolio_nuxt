export const Skills = {
  REACT: 'react',
  REDUX: 'redux',
  JS: 'js',
  TS: 'ts',
  CSS: 'css',
  SCSS: 'scss',
  NEXT_JS: 'next.js',
  NEST_JS: 'nest.js',
  GATSBY_JS: 'gatsby.js',
  HTML5: 'html5',
  TAILWIND: 'tailwindcss',
  STYLED_COMPONENTS: 'styled-components',
  REDUX_TOOLKIT: 'redux toolkit',
  RTK_QUERY: 'RTK Query',
  REACT_QUERY: 'React Query',
  J_QUERY: 'jQuery',
  GRAPHQL: 'GraphQL',
  REST_API: 'REST',
  JEST: 'Jest',
  PLAYRWRIGHT: 'Playwright',
  WEBPAK: 'WebPack',
  VITE: 'vite',
  GULP: 'Gulp',
  GIT: 'Git',
  GIT_HUB: 'Git hub',
  GIT_LAB: 'Git lab',
  FIGMA: 'figma',
  AVOCODE: 'Avocode',
  SKETCH: 'Sketch',
  VUE_3: 'vue3',
  NUXT: 'nuxt',
} as const;

export interface ISkill {
  name: string;
  icon: string;
  logoAlt?: string;
  link?: string;
}
