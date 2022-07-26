port module Main exposing (main)


type alias Flags =
    {}


type alias Model =
    {}


type Msg
    = Input String


port get : (String -> msg) -> Sub msg


port put : String -> Cmd msg


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( {}, Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Input text ->
            ( model, put text )


subscriptions : Model -> Sub Msg
subscriptions model =
    get Input


main : Program Flags Model Msg
main =
    Platform.worker
        { init = init
        , update = update
        , subscriptions = subscriptions
        }
