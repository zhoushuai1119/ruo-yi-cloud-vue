export interface DatasourceVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 数据源名称
   */
  name: string;

  /**
   * 数据库驱动
   */
  driverClassName: string;

  /**
   * 数据库连接地址
   */
  url: string;

  /**
   * 数据库用户名
   */
  userName: string;

  /**
   * 数据库密码
   */
  password: string;
}

export interface DatasourceForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 数据源名称
   */
  name?: string;

  /**
   * 数据库驱动
   */
  driverClassName?: string;

  /**
   * 数据库连接地址
   */
  url?: string;

  /**
   * 数据库用户名
   */
  userName?: string;

  /**
   * 数据库密码
   */
  password?: string;
}

export interface DatasourceQuery extends PageQuery {

  /**
   * 数据源名称
   */
  name?: string;

}
