import getAll from "./routes/getAll"
import store from "./routes/store"

const DataController = {
  index: getAll,
  store,
}

export default DataController
