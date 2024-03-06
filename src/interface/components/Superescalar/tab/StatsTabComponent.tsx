import * as React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { EChart } from "@kbox-labs/react-echarts";

const mapStateToProps = (state) => {
  return {
    commited: state.Machine.stats.commited,
    discarded: state.Machine.stats.discarded,
    instrCommitPercentage: state.Machine.stats.commitedPerInstr,
    unitsOcupation: state.Machine.stats.unitsOcupation,
    statusesCount: state.Machine.stats.statusesCount,
    instrStatuses: state.Machine.stats.instructionsStatusesAverageCycles,
    cyclesPerReplication: state.Ui.batchResults,
    code: state.Machine.code,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators({}, dispatch),
  };
};

type StatsTabComponentProps = WithTranslation &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

export const StatsTabComponent: React.FC = (
  props: StatsTabComponentProps
): React.ReactNode => {
  const formatTableNumber = (value: number): string => {
    const formattedNumber = Math.round(value * 100) / 100 || "-";
    return String(formattedNumber);
  };

  return (
    <div className="container text-center">
      <div className="row">
        <div className="col">
          <EChart
            // title={"hello" as string & TitleOption}
            // title={{
            //   text: props.t("stats.instrStatuses"),
            //   left: "center",
            // }}
            style={{
              height: "25rem",
              width: "100%",
            }}
            legend={{
              top: "bottom",
              selected: {
                [props.t("stats.statuses.commitNumber")]: false,
              },
            }}
            toolbox={{
              feature: {
                saveAsImage: {},
                dataView: {
                  readOnly: true,
                  lang: [
                    props.t("stats.toolbox.dataView"),
                    props.t("stats.toolbox.close"),
                    props.t("stats.toolbox.refresh"),
                  ],
                },
              },
            }}
            tooltip={{
              trigger: "axis",
              axisPointer: {
                type: "cross",
              },
            }}
            xAxis={{
              type: "category",
            }}
            yAxis={{
              type: "value",
            }}
            series={
              props.statusesCount &&
              Array.from(props.statusesCount.keys()).map((status) => {
                return {
                  name: props.t("stats.statuses." + status),
                  type: "bar",
                  stack: "statuses",
                  data: props.statusesCount.get(status),
                };
              })
            }
          />
        </div>
        <div className="col">
          <EChart
            // title={{
            //   text: props.t("stats.unitsOcupation"),
            //   left: "center",
            // }}
            style={{
              height: "25rem",
              width: "100%",
            }}
            legend={{
              top: "bottom",
              selected: {
                [props.t("stats.units.rs0")]: false,
                [props.t("stats.units.rs1")]: false,
                [props.t("stats.units.rs2")]: false,
                [props.t("stats.units.rs3")]: false,
                [props.t("stats.units.rs4")]: false,
                [props.t("stats.units.rs5")]: false,
                [props.t("stats.units.fu0")]: false,
                [props.t("stats.units.fu1")]: false,
                [props.t("stats.units.fu2")]: false,
                [props.t("stats.units.fu3")]: false,
                [props.t("stats.units.fu4")]: false,
                [props.t("stats.units.fu5")]: false,
              },
            }}
            toolbox={{
              feature: {
                saveAsImage: {},
                dataView: {
                  readOnly: true,
                  lang: [
                    props.t("stats.toolbox.dataView"),
                    props.t("stats.toolbox.close"),
                    props.t("stats.toolbox.refresh"),
                  ],
                },
              },
            }}
            tooltip={{
              trigger: "axis",
              axisPointer: {
                type: "cross",
              },
            }}
            xAxis={{
              type: "category",
            }}
            yAxis={{
              type: "value",
              max: 100,
              axisLabel: {
                formatter: "{value}%",
              },
            }}
            series={
              props.unitsOcupation &&
              Array.from(props.unitsOcupation.keys()).map((unitName) => {
                return {
                  name: props.t("stats.units." + unitName),
                  type: "line",
                  data: props.unitsOcupation
                    .get(unitName)
                    .map((value) => value * 100),
                };
              })
            }
          />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <EChart
            // title={{
            //   text: props.t("stats.commitDiscard"),
            //   left: "center",
            // }}
            style={{
              height: "13rem",
              width: "100%",
            }}
            toolbox={{
              feature: {
                saveAsImage: {},
              },
            }}
            series={[
              {
                type: "pie",
                radius: "65%",
                label: {
                  formatter: "{b}: {c} ({d}%)",
                },
                data: [
                  {
                    value: props.commited,
                    name: props.t("stats.commited"),
                  },
                  {
                    value: props.discarded,
                    name: props.t("stats.discarded"),
                  },
                ],
              },
            ]}
          />
          {props.cyclesPerReplication.length > 0 && (
            <EChart
              // title={{
              //   text: props.t("stats.cycles"),
              //   left: "center",
              // }}
              style={{
                height: "13rem",
                width: "100%",
              }}
              toolbox={{
                feature: {
                  saveAsImage: {},
                  dataView: {
                    readOnly: true,
                    lang: [
                      props.t("stats.toolbox.dataView"),
                      props.t("stats.toolbox.close"),
                      props.t("stats.toolbox.refresh"),
                    ],
                  },
                },
              }}
              tooltip={{
                trigger: "axis",
                axisPointer: {
                  type: "cross",
                },
              }}
              xAxis={{
                type: "category",
              }}
              yAxis={{
                type: "value",
              }}
              series={{
                name: props.t("stats.cycles"),
                type: "line",
                data: props.cyclesPerReplication,
              }}
            />
          )}
        </div>
        <div className="col-8 overflow-auto" style={{ maxHeight: "25rem" }}>
          <p className="h4">{props.t("stats.statusAverage")}</p>
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">{props.t("Code")}</th>
                <th scope="col">{props.t("stats.statuses.prefetchNumber")}</th>
                <th scope="col">{props.t("stats.statuses.decodeNumber")}</th>
                <th scope="col">{props.t("stats.statuses.issueNumber")}</th>
                <th scope="col">{props.t("stats.statuses.executeNumber")}</th>
                <th scope="col">{props.t("stats.statuses.writeBackNumber")}</th>
                <th scope="col">{props.t("stats.statuses.commitNumber")}</th>
              </tr>
            </thead>
            <tbody>
              {props.instrCommitPercentage &&
                props.instrCommitPercentage.map((d) => (
                  <tr key={d.name}>
                    <th scope="row">{d.name}</th>
                    <td>{props.code[d.name].toString()}</td>
                    <td>
                      {formatTableNumber(
                        props.instrStatuses.get(d.name).prefetchCycles
                      )}
                    </td>
                    <td>
                      {formatTableNumber(
                        props.instrStatuses.get(d.name).decodeCycles
                      )}
                    </td>
                    <td>
                      {formatTableNumber(
                        props.instrStatuses.get(d.name).issueCycles
                      )}
                    </td>
                    <td>
                      {formatTableNumber(
                        props.instrStatuses.get(d.name).executeCycles
                      )}
                    </td>
                    <td>
                      {formatTableNumber(
                        props.instrStatuses.get(d.name).writeBackCycles
                      )}
                    </td>
                    <td>{formatTableNumber(d.value * 100)}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(StatsTabComponent));
