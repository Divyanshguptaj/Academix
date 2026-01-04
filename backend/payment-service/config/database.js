import { createDatabaseConnection } from 'shared-utils';

const connect = createDatabaseConnection('payment_service');

export default connect;
