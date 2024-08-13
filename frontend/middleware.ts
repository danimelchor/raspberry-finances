import { chain } from "./middlewares/chain";
import { withAuth } from "./middlewares/withAuth";
import { withNoAuth } from "./middlewares/withNoAuth";

const middlewares = [withAuth, withNoAuth];
export default chain(middlewares);
