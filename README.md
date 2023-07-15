# snitch-server

This is a Golang microservice template.

It uses:

1. `httprouter` for the router
1. `logrus` for logging
1. `envconfig` for env parser
1. `kingpin` for CLI args

----

To use this template:

1. Use Github template to generate new project
1. Replace the strings `snitch-server` and `GO_TEMPLATE` with preferred `service-name` and `SERVICE_NAME`.   Ignore `sed: RE error: illegal byte sequence`
    1. `find . -maxdepth 3 -type f -exec sed -i "" 's/snitch-server/service-name/g' {} \;`
    1. `find . -maxdepth 3 -type f -exec sed -i "" 's/GO_TEMPLATE/SERVICE_NAME/g' {} \;`
    1. `mv .github.rename .github`
