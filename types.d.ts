interface IStatus {
  username: string;
  anonymous: string;
  logout_is_available: boolean;
  space: {
    recipe: string;
  };
  tiddlywiki_version: string;
}

interface ActionOptions {
  host: string;
  port: string | number;
  twpath: string;
  username: string;
}