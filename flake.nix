{
  description = "A development environment for a web app running on Bun.";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
        config = {
          allowUnfree = true;
        };
      };

      # Bun dev environment
      bunShell = pkgs.mkShell {
        name = "tools-shell";
        packages = [
          pkgs.bun # Latest Bun runtime
          pkgs.nodejs # Additional tooling
          pkgs.git # Git for version control
          pkgs.aider-chat # AI coding assistant
					pkgs.gcc # sharp dependency
        ];

        shellHook = ''
          echo "Running bun install to prepare the environment...";
          ${pkgs.bun}/bin/bun install || echo "bun install failed. Check your dependencies.";
          echo "Environment ready for development. Use 'bun dev' to start the dev server."
        '';
      };
    in {
      devShells = {
        default = bunShell;
      };
    });
}
