{
  description = "simde";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    pnpm2nix = {
      url = "github:nzbr/pnpm2nix-nzbr";
			inputs.nixpkgs.follows = "nixpkgs";
      };
  };

  outputs = { self, nixpkgs, flake-utils, pnpm2nix, ... } @ inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs { inherit system; };
      in with pkgs; rec {
        # Development environment
        devShell = mkShell {
          name = "simde";
          nativeBuildInputs = [ nodejs nodePackages.pnpm ];
        };

        # Build package into dist/ dir with pnpm
        dist = pnpm2nix.packages.${system}.mkPnpmPackage {
          src = ./.;
        };

        # Create SIMDE dist/ + SWS bundle
        packages.app = pkgs.writeShellScriptBin "app" ''
          ${pkgs.static-web-server}/bin/static-web-server --root ${dist}.distDir
        '';

        # The default package when a specific package name isn't specified
        defaultPackage = packages.app;
      }
    );
}
