# SIMDE
[![Build Status](https://travis-ci.org/etsiiull/SIMDE.svg?branch=master)](https://travis-ci.org/etsiiull/SIMDE)
[![Coverage Status](https://coveralls.io/repos/github/etsiiull/SIMDE/badge.svg?branch=master)](https://coveralls.io/github/etsiiull/SIMDE?branch=master)


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

## Troubling?

If you have any doubt you should check [the official docs](https://etsiiull.gitbooks.io/simde/).

## License

The project has been released under GPLv3 License.

---

> [@adrianabreu](https://github.com/adrianabreu) &nbsp;&middot;&nbsp;
> [@icasrod](https://twitter.com/icasrod)