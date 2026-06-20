import { Minus, Plus } from 'lucide-react';
import LiveDot from './LiveDot';
import { lbIconProps } from './icons';
import {
  GRAPH_RANGE_OPTIONS,
  type GraphRange,
} from '../lib/graphRange';
import { GRAPH_ZOOM_MAX, GRAPH_ZOOM_MIN, GRAPH_ZOOM_STEP } from './ProgressGraph';

type Props = {
  range: GraphRange;
  onRangeChange: (range: GraphRange) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showLive?: boolean;
};

function applyRangeChange(
  key: GraphRange,
  range: GraphRange,
  onRangeChange: (range: GraphRange) => void,
  onZoomChange: (zoom: number) => void,
) {
  if (key !== range) {
    onRangeChange(key);
    onZoomChange(1);
  }
}

export default function GraphRangeControls({
  range,
  onRangeChange,
  zoom,
  onZoomChange,
  showLive = false,
}: Props) {
  const zoomOut = () => onZoomChange(Math.max(GRAPH_ZOOM_MIN, zoom - GRAPH_ZOOM_STEP));
  const zoomIn = () => onZoomChange(Math.min(GRAPH_ZOOM_MAX, zoom + GRAPH_ZOOM_STEP));

  return (
    <div className="graph-range-controls">
      <div className="graph-range-controls-desktop stf">
        {GRAPH_RANGE_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`stf-btn ${range === key ? 'on' : ''}`}
            onClick={() => applyRangeChange(key, range, onRangeChange, onZoomChange)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className="stf-btn graph-zoom-btn"
          aria-label="Zoom out"
          disabled={zoom <= GRAPH_ZOOM_MIN}
          onClick={zoomOut}
        >
          <Minus size={14} {...lbIconProps()} />
        </button>
        <button
          type="button"
          className="stf-btn graph-zoom-btn"
          aria-label="Zoom in"
          disabled={zoom >= GRAPH_ZOOM_MAX}
          onClick={zoomIn}
        >
          <Plus size={14} {...lbIconProps()} />
        </button>
        {showLive ? (
          <button type="button" className="stf-btn on" aria-hidden>
            <LiveDot style={{ display: 'inline-block', marginRight: 3 }} />
            Live
          </button>
        ) : null}
      </div>

      <div className="graph-range-controls-mobile">
        <div className="graph-range-section graph-range-section--filter">
          <select
            className="graph-range-select"
            value={range}
            aria-label="Graph time range"
            onChange={(e) =>
              applyRangeChange(e.target.value as GraphRange, range, onRangeChange, onZoomChange)
            }
          >
              {GRAPH_RANGE_OPTIONS.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
          </select>
        </div>

        <div className="graph-range-section graph-range-section--zoom">
          <button
            type="button"
            className="graph-range-mobile-btn graph-range-mobile-btn--zoom"
            aria-label="Zoom out"
            disabled={zoom <= GRAPH_ZOOM_MIN}
            onClick={zoomOut}
          >
            <Minus size={12} {...lbIconProps()} />
          </button>
          <button
            type="button"
            className="graph-range-mobile-btn graph-range-mobile-btn--zoom"
            aria-label="Zoom in"
            disabled={zoom >= GRAPH_ZOOM_MAX}
            onClick={zoomIn}
          >
            <Plus size={12} {...lbIconProps()} />
          </button>
        </div>

        {showLive ? (
          <div className="graph-range-section graph-range-section--status">
            <span className="graph-range-mobile-live" aria-hidden>
              <LiveDot />
              Live
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
