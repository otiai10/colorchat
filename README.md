# Color Chat

as a very simple example of chat application written in Go.

![](https://user-images.githubusercontent.com/931554/32556904-0d39e906-c4e4-11e7-80b4-140268d5c4b7.png)

# Getting Started

```
% go get -u github.com/otiai10/colorchat/...
% colorchat
```

# Deploy to Heroku

It's just an example of `golang.org/x/net/websocket` package, so it's not expected to be deployed and used widely. Nevertheless, if you want to deploy your own, hit following commands

```sh
# heroku login #(if needed)
% heroku create
# heroku container:login #(if needed)
% heroku container push
# heroku open
```
