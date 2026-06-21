import { Component } from "react";

/**
 * Wrap any asset-loading subtree (useGLTF, drei <Environment>, etc.) that
 * might 404 or fail to parse. On error, renders `fallback` instead of
 * taking down the whole Canvas tree.
 *
 * Usage:
 *   <AssetErrorBoundary fallback={<CheapFallback />}>
 *     <Suspense fallback={null}>
 *       <HeavyGLTFThing />
 *     </Suspense>
 *   </AssetErrorBoundary>
 */
export default class AssetErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    if (this.props.label) {
      console.warn(`[${this.props.label}] failed to load, using fallback:`, error?.message || error);
    }
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
