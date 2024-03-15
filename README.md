# SIMDE
[![Build Status](https://travis-ci.org/etsiiull/SIMDE.svg?branch=master)](https://travis-ci.org/etsiiull/SIMDE)
[![All Contributors](https://img.shields.io/github/all-contributors/SIMDE-ULL/SIMDE?color=ee8449&style=flat-square)](#contributors)

![Live exec](/assets/exec.gif)

## What is SIMDE?

SIMDE is a simulator for supporting teaching of [ILP (Instruction Level Parallelism)](https://en.wikipedia.org/wiki/Instruction-level_parallelism) Architectures. 

This simulator is a visual representation of a Superecalar machine execution and the students are able to see how the instructions move through the multiple stages of the pipeline. 

This make easier to learn concepts suchs as *Tomasulo's algorithm* and the purpose of structures such as the reorderbuffer.

## Technologies

SIMDE is powered by Typescript, React, Redux, Sass and Webpack.

## How to use

[Go to the project website and start learning](https://etsiiull.github.io/SIMDE/)

## Development

SIMDE is build on top of typescript,sass and webpack. In order to make the build easier a docker file environment has been added.
Just install docker and docker-compose and type:

`docker-compose up`

All services should be configurated and ready for deployment.

Please beware that we copy the package.json each time we build the image so if you add more dependencies you should run `docker-compose build` in order to recreate the image.

## Troubling?

If you have any doubt you should check [the official docs](https://etsiiull.gitbooks.io/simde/).

## License

The project has been released under GPLv3 License.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/icasrod"><img src="https://avatars.githubusercontent.com/u/17193911?v=4?s=100" width="100px;" alt="Iván Castilla Rodríguez"/><br /><sub><b>Iván Castilla Rodríguez</b></sub></a><br /><a href="#research-icasrod" title="Research">🔬</a> <a href="#projectManagement-icasrod" title="Project Management">📆</a> <a href="#mentoring-icasrod" title="Mentoring">🧑‍🏫</a> <a href="#ideas-icasrod" title="Ideas, Planning, & Feedback">🤔</a> <a href="#example-icasrod" title="Examples">💡</a> <a href="#doc-icasrod" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://adrianabreu.gitlab.io"><img src="https://avatars.githubusercontent.com/u/9080392?v=4?s=100" width="100px;" alt="Adrian Abreu Gonzalez"/><br /><sub><b>Adrian Abreu Gonzalez</b></sub></a><br /><a href="#platform-adrianabreu" title="Packaging/porting to new platform">📦</a> <a href="#design-adrianabreu" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/alu0100884012"><img src="https://avatars.githubusercontent.com/u/22546849?v=4?s=100" width="100px;" alt="alu0100884012"/><br /><sub><b>alu0100884012</b></sub></a><br /><a href="#platform-alu0100884012" title="Packaging/porting to new platform">📦</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://oxca.be"><img src="https://avatars.githubusercontent.com/u/25517190?v=4?s=100" width="100px;" alt="Óscar Carrasco"/><br /><sub><b>Óscar Carrasco</b></sub></a><br /><a href="#mentoring-oxcabe" title="Mentoring">🧑‍🏫</a> <a href="#maintenance-oxcabe" title="Maintenance">🚧</a> <a href="#platform-oxcabe" title="Packaging/porting to new platform">📦</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/endes0"><img src="https://avatars.githubusercontent.com/u/5920682?v=4?s=100" width="100px;" alt="endes0"/><br /><sub><b>endes0</b></sub></a><br /><a href="#test-endes0" title="Tests">⚠️</a> <a href="#maintenance-endes0" title="Maintenance">🚧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
