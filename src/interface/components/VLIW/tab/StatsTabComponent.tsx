import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { EChart } from '@kbox-labs/react-echarts'

export class StatsTabComponent extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    formatTableNumber(value: number) {
        return Math.round(value * 100) / 100 || '-';
    }

    render() {
        return (
            <div className="container text-center">
                <div className="row">
                    <div className="col">
                        <EChart
                            title={{
                                text: 'Units ocupation per cycle',
                                left: 'center'
                            }}
                            style={{
                                height: "25rem",
                                width: "100%"
                            }}
                            legend={{
                                top: 'bottom'
                            }}
                            toolbox={{
                                feature: {
                                    saveAsImage: {},
                                    dataView: { readOnly: true, lang: ['Data View', 'Close', 'Refresh'] },
                                }
                            }}
                            tooltip={
                                {
                                    trigger: 'axis',
                                    axisPointer: {
                                        type: 'cross'
                                    }
                                }

                            }
                            xAxis={{
                                type: 'category'
                            }}
                            yAxis={{
                                type: 'value',
                                max: 100,
                                axisLabel: {
                                    formatter: '{value}%'
                                }
                            }}
                            series={
                                this.props.unitsOcupation && Array.from(this.props.unitsOcupation.keys()).map((unitName) => {
                                    return {
                                        name: unitName,
                                        type: 'line',
                                        data: this.props.unitsOcupation.get(unitName).map((value) => value * 100)
                                    }
                                })
                            }
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        { this.props.cyclesPerReplication.length > 0 && <EChart
                            title={{
                                text: 'Cycles per iteration',
                                left: 'center'
                            }}
                            style={{
                                height: "13rem",
                                width: "100%",
                            }}
                            toolbox={{
                                feature: {
                                    saveAsImage: {},
                                    dataView: { readOnly: true, lang: ['Data View', 'Close', 'Refresh'] },
                                }
                            }}
                            tooltip={
                                {
                                    trigger: 'axis',
                                    axisPointer: {
                                        type: 'cross'
                                    }
                                }

                            }
                            xAxis={{
                                type: 'category'
                            }}
                            yAxis={{
                                type: 'value'
                            }}
                            series={{
                                name: 'Cycles per iteration',
                                type: 'line',
                                data: this.props.cyclesPerReplication
                            }}
                        />}
                    </div>
                </div>
            </div>

        );
    };
}

const mapStateToProps = state => {
    return {
        commited: state.Machine.stats.commited,
        discarded: state.Machine.stats.discarded,
        instrCommitPercentage: state.Machine.stats.commitedPerInstr,
        unitsOcupation: state.Machine.stats.unitsOcupation,
        statusesCount: state.Machine.stats.statusesCount,
        instrStatuses: state.Machine.stats.instructionsStatusesAverageCycles,
        cyclesPerReplication: state.Ui.batchResults,
        code: state.Machine.code
    }
}

const mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators({

        }, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StatsTabComponent);